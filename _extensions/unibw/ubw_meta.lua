-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
-- Design © 2026 Nikolaus Köberlein (github.com/nkoeberlein). Assets excluded.

-- Helpers for ubw.lua: reading YAML metadata, labels, files, profile card.

local M = {}

M.LABELS = {
  de = {
    cohort = "Jahrgang",
    slide = "Folie",
    expertise = "Schwerpunkte",
    student_id = "Matrikelnr.",
    end_title = "Vielen Dank — Fragen?",
    references = "Quellen",
    overflow = "Inhalt passt nicht – Folie teilen oder kürzen",
  },
  en = {
    cohort = "Class of",
    slide = "Slide",
    expertise = "Focus",
    student_id = "Student ID",
    end_title = "Thank you — Questions?",
    references = "References",
    overflow = "Content does not fit – split or shorten the slide",
  },
}

local function trim(s)
  return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Value of a YAML key as plain text; nil if the key is missing or empty.
function M.text(meta, key)
  local v = meta[key]
  if v == nil then return nil end
  local kind = pandoc.utils.type(v)
  if kind == "boolean" then return nil end
  local s
  if kind == "List" then
    local parts = {}
    for _, item in ipairs(v) do parts[#parts + 1] = pandoc.utils.stringify(item) end
    s = table.concat(parts, ", ")
  else
    s = pandoc.utils.stringify(v)
  end
  s = trim(s)
  if s == "" then return nil end
  return s
end

-- Boolean YAML key; accepts true/false as well as "true"/"false".
function M.flag(meta, key, default)
  local v = meta[key]
  if v == nil then return default end
  if pandoc.utils.type(v) == "boolean" then return v end
  local s = pandoc.utils.stringify(v):lower()
  if s == "false" or s == "no" or s == "off" then return false end
  if s == "true" or s == "yes" or s == "on" then return true end
  return default
end

-- Author names. Quarto normalizes `author` into `by-author`.
function M.authors(meta)
  local by = meta["by-author"]
  if by and #by > 0 then
    local names = {}
    for _, a in ipairs(by) do
      if a.name and a.name.literal then
        names[#names + 1] = pandoc.utils.stringify(a.name.literal)
      end
    end
    if #names > 0 then return table.concat(names, ", ") end
  end
  return M.text(meta, "author")
end

-- Labels for the document language, overridable with the YAML map `ubw-labels`.
function M.labels(meta)
  local lang = (M.text(meta, "lang") or "de"):sub(1, 2):lower()
  local labels = {}
  for k, v in pairs(M.LABELS[lang] or M.LABELS.de) do labels[k] = v end
  local custom = meta["ubw-labels"]
  if custom and pandoc.utils.type(custom) == "table" then
    for k, v in pairs(custom) do labels[k:gsub("-", "_")] = pandoc.utils.stringify(v) end
  end
  return labels
end

function M.esc(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

local MIME = {
  png = "image/png", jpg = "image/jpeg", jpeg = "image/jpeg",
  svg = "image/svg+xml", gif = "image/gif", webp = "image/webp",
}

function M.data_uri(path)
  local f = io.open(path, "rb")
  if not f then return nil end
  local bytes = f:read("a")
  f:close()
  local ext = (path:match("%.(%w+)$") or ""):lower()
  return "data:" .. (MIME[ext] or "application/octet-stream") .. ";base64," .. quarto.base64.encode(bytes)
end

-- Image given by a YAML key (path relative to the deck) or, if the key is not
-- set, a file shipped with the extension. `key: false` switches it off.
function M.image(meta, key, bundled)
  if M.flag(meta, key, true) == false then return nil end
  local user = M.text(meta, key)
  local path
  if user and user:lower() ~= "true" then
    path = user
    if not pandoc.path.is_absolute(path) then
      path = pandoc.path.join({ pandoc.path.directory(quarto.doc.input_file), path })
    end
  else
    path = quarto.utils.resolve_path(bundled)
  end
  local uri = M.data_uri(path)
  if not uri then
    quarto.log.warning("[ubw] " .. key .. ": Datei nicht gefunden: " .. path)
  end
  return uri
end

-- Profile card of the end slide, built from the YAML fields that are set.
function M.steckbrief(meta, labels)
  local function field(key)
    local s = M.text(meta, key)
    return s and M.esc(s) or nil
  end
  local out = {}
  local function p(class, html)
    out[#out + 1] = '<p class="' .. class .. '">' .. html .. "</p>"
  end

  local author = M.authors(meta)
  if author then
    local rank = field("author-title")
    p("steck-name", (rank and rank .. " " or "") .. M.esc(author))
  end
  if field("position") then p("steck-position", field("position")) end

  local org = {}
  if field("chair") then org[#org + 1] = field("chair") end
  local institute, faculty = field("institute"), field("faculty")
  if institute and faculty then
    org[#org + 1] = institute .. " &mdash; " .. faculty
  elseif institute or faculty then
    org[#org + 1] = institute or faculty
  end
  if field("university") then org[#org + 1] = field("university") end
  if #org > 0 then p("steck-org", table.concat(org, "<br>")) end

  if field("email") then p("steck-contact", field("email")) end
  local website = field("profile-website")
  if website then
    p("steck-website", '<a href="' .. website .. '">' .. website:gsub("^https?://", "") .. "</a>")
  end
  if field("expertise") then
    p("steck-expertise", "<strong>" .. M.esc(labels.expertise) .. ":</strong> " .. field("expertise"))
  end

  local ids = {}
  if field("student-id") then ids[#ids + 1] = M.esc(labels.student_id) .. " " .. field("student-id") end
  if field("cohort") then ids[#ids + 1] = M.esc(labels.cohort) .. " " .. field("cohort") end
  if #ids > 0 then p("steck-ids", table.concat(ids, " &mdash; ")) end

  return pandoc.RawBlock("html", table.concat(out, "\n"))
end

return M
