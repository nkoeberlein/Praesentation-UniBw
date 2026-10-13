-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
-- Design © 2026 Nikolaus Köberlein (github.com/nkoeberlein). Assets excluded.

-- Pandoc filter of the UniBw format. Takes over what had to be written by
-- hand in every deck:
--   * H1 headings become section dividers with the section color
--   * `## Title {source="…"}` adds a source line at the bottom of the slide
--   * a references slide and the end slide are appended automatically
--   * an empty `.steckbrief` div is filled from the YAML metadata
--   * YAML metadata reaches the page as one JSON block for includes/chrome.html

local script_dir = pandoc.path.directory(quarto.utils.resolve_path("ubw.lua"))
package.path = pandoc.path.join({ script_dir, "?.lua" }) .. ";" .. package.path
local M = require("ubw_meta")

local function has_class(el, class)
  return el.classes and el.classes:includes(class)
end

local function has_background(header)
  for key, _ in pairs(header.attributes) do
    if key:match("background") then return true end
  end
  return false
end

-- Section dividers: every heading above slide level gets the section color.
local function color_dividers(blocks, slide_level, color)
  for _, block in ipairs(blocks) do
    if block.t == "Header" and block.level < slide_level and not has_background(block) then
      block.attributes["background-color"] = color
    end
  end
end

-- `source="…"` on a slide heading becomes a `.slide-source` line at the end of
-- that slide. The text is read as Markdown, so citations and links work.
local function add_sources(blocks, slide_level)
  local out = pandoc.List()
  local pending = nil
  local function flush()
    if pending then
      out:insert(pandoc.Div(pandoc.read(pending, "markdown").blocks, pandoc.Attr("", { "slide-source" })))
      pending = nil
    end
  end
  for _, block in ipairs(blocks) do
    local starts_slide = block.t == "HorizontalRule" or (block.t == "Header" and block.level <= slide_level)
    if starts_slide then flush() end
    if block.t == "Header" and block.attributes["source"] then
      pending = block.attributes["source"]
      block.attributes["source"] = nil
    end
    out:insert(block)
  end
  flush()
  return out
end

local function find_header_with_class(blocks, class)
  for i, block in ipairs(blocks) do
    if block.t == "Header" and has_class(block, class) then return i end
  end
  return nil
end

local function has_refs_div(doc)
  local found = false
  doc:walk({
    Div = function(div)
      if div.identifier == "refs" then found = true end
    end,
  })
  return found
end

local function references_slide(meta, labels)
  local title = M.text(meta, "reference-section-title") or labels.references
  return {
    pandoc.Header(2, title, pandoc.Attr("ubw-references", { "smaller" })),
    pandoc.Div({}, pandoc.Attr("refs")),
  }
end

local function end_slide(meta, labels, color)
  local columns = {}
  local photo = M.text(meta, "profile-photo")
  if photo then
    local frame = pandoc.Div({ pandoc.Para({ pandoc.Image({}, photo) }) }, pandoc.Attr("", { "profile-photo" }))
    columns[#columns + 1] = pandoc.Div({ frame }, pandoc.Attr("", { "column" }))
  end
  local card = pandoc.Div({ M.steckbrief(meta, labels) }, pandoc.Attr("", { "steckbrief" }))
  columns[#columns + 1] = pandoc.Div({ card }, pandoc.Attr("", { "column" }))

  return {
    pandoc.Header(2, {}, pandoc.Attr("ubw-end", { "end-slide" }, { ["background-color"] = color })),
    pandoc.Header(3, M.text(meta, "end-title") or labels.end_title, pandoc.Attr("", { "end-title" })),
    pandoc.Div(columns, pandoc.Attr("", { "columns", "end-columns" })),
  }
end

-- Everything includes/chrome.html and includes/auto-fit.html need at runtime.
local function page_config(meta, labels)
  local config = {
    author = M.authors(meta),
    date = M.text(meta, "date"),
    title = M.text(meta, "short-title") or M.text(meta, "title"),
    professor = M.text(meta, "professor"),
    logoLeft = M.image(meta, "logo-left", "assets/IA_logo.png"),
    logoRight = M.image(meta, "logo-right", "assets/Signet_UniBw.svg"),
    density = M.text(meta, "ubw-density"),
    animations = M.flag(meta, "ubw-animations", true),
    labels = { slide = labels.slide, overflow = labels.overflow },
  }
  -- "<" must not appear literally inside a <script> element
  local json = quarto.json.encode(config):gsub("<", "\\u003c")
  quarto.doc.include_text("in-header", '<script id="ubw-config" type="application/json">' .. json .. "</script>")
end

-- Values the title slide partial (title-slide.html) cannot compute itself.
local function title_slide_meta(meta, labels)
  local author = M.authors(meta)
  if author then
    local rank = M.text(meta, "author-title")
    meta["ubw-author-line"] = (rank and rank .. " " or "") .. author
  end
  local course, instructor = M.text(meta, "course-name"), M.text(meta, "course-instructor")
  if course and instructor then
    meta["ubw-course-line"] = course .. " — " .. instructor
  elseif course or instructor then
    meta["ubw-course-line"] = course or instructor
  end
  meta["ubw-label-cohort"] = labels.cohort

  if meta["title-slide-attributes"] == nil then
    local background = M.image(meta, "title-background", "assets/luftaufnahme-unibw-muenchen.jpg")
    if background then
      meta["title-slide-attributes"] = {
        ["data-background-image"] = background,
        ["data-background-size"] = "cover",
        ["data-background-position"] = "center",
        ["data-background-opacity"] = "0.15",
      }
    end
  end
end

local function process(doc)
  local meta = doc.meta
  local labels = M.labels(meta)
  local slide_level = tonumber(M.text(meta, "slide-level")) or 2
  local color = M.text(meta, "section-color") or "#2A3D7A"

  -- An empty `.steckbrief` div written by hand is filled as well
  doc = doc:walk({
    Div = function(div)
      if has_class(div, "steckbrief") and #div.content == 0 then
        div.content = { M.steckbrief(meta, labels) }
        return div
      end
    end,
  })

  color_dividers(doc.blocks, slide_level, color)
  local blocks = add_sources(doc.blocks, slide_level)

  local manual_end = find_header_with_class(blocks, "end-slide")

  if meta.bibliography and M.flag(meta, "references-slide", true) and not has_refs_div(doc) then
    local at = manual_end or (#blocks + 1)
    for offset, block in ipairs(references_slide(meta, labels)) do
      blocks:insert(at + offset - 1, block)
    end
  end

  if not manual_end and M.flag(meta, "end-slide", true) then
    blocks:extend(end_slide(meta, labels, color))
  end

  title_slide_meta(meta, labels)
  page_config(meta, labels)

  doc.blocks = blocks
  doc.meta = meta
  return doc
end

return { { Pandoc = process } }
