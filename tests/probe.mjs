// Collects layout facts for every slide of a rendered deck.
// Used by check-slides.mjs; can also be run directly to dump the raw numbers:
//   node tests/probe.mjs demo.html [--shots <dir>]

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from '../_extensions/unibw/tools/cdp.mjs';

// Runs inside the page. Returns facts about the slide that is currently shown.
const PROBE = `(function () {
  var slide = Reveal.getCurrentSlide();
  var rect = function (el) { var r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, width: r.width }; };
  var header = document.querySelector('.ubw-header');
  var footer = document.querySelector('.ubw-footer');
  var shown = function (el) { return !!el && getComputedStyle(el).opacity !== '0' && getComputedStyle(el).display !== 'none'; };

  var kids = Array.prototype.filter.call(slide.children, function (el) {
    return el.tagName !== 'ASIDE' && el.offsetParent !== null && getComputedStyle(el).position !== 'absolute';
  });
  var contentTop = kids.length ? Math.min.apply(null, kids.map(function (k) { return rect(k).top; })) : null;
  var contentBottom = kids.length ? Math.max.apply(null, kids.map(function (k) { return rect(k).bottom; })) : null;

  var columns = Array.prototype.map.call(slide.querySelectorAll('.columns'), function (row) {
    var cols = Array.prototype.filter.call(row.children, function (c) { return c.classList.contains('column'); });
    return cols.map(function (c) {
      return { declared: parseFloat(c.style.width) || null, actual: rect(c).width };
    });
  });

  var prevH1 = '';
  var all = Reveal.getSlides();
  for (var i = 0; i < all.length; i++) {
    var h1 = all[i].querySelector(':scope > h1');
    if (h1 && all[i].id !== 'title-slide') prevH1 = h1.textContent.trim();
    if (all[i] === slide) break;
  }

  var h2 = slide.querySelector(':scope > h2, :scope > nav > h2');
  var titleEl = header && header.querySelector('.ubw-header-title');
  var numEl = footer && footer.querySelector('.ubw-footer-num');
  var dateEl = footer && footer.querySelector('.ubw-footer-date');
  return {
    id: slide.id,
    classes: slide.className,
    clientHeight: slide.clientHeight,
    scrollHeight: slide.scrollHeight,
    transform: slide.style.transform || '',
    fontSize: getComputedStyle(slide).fontSize,
    titleSize: h2 && h2.textContent.trim() ? parseFloat(getComputedStyle(h2).fontSize) : null,
    fit: slide.getAttribute('data-ubw-fit'),
    overflow: slide.hasAttribute('data-ubw-overflow'),
    headerShown: shown(header),
    footerShown: shown(footer),
    headerBottom: header ? rect(header).bottom : null,
    footerTop: footer ? rect(footer).top : null,
    contentTop: contentTop,
    contentBottom: contentBottom,
    headerTitle: titleEl ? titleEl.textContent.trim() : null,
    expectedSection: prevH1,
    footerNum: numEl ? numEl.textContent.trim() : null,
    footerDate: dateEl ? dateEl.textContent.trim() : null,
    columns: columns,
    hash: location.hash
  };
})()`;

// Waits until entrance animations have finished, so positions are final.
const SETTLE = 'Promise.all(document.getAnimations().map(function (a) { return a.finished.catch(function () {}); }))' +
  '.then(function () { return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 30); }); }); })';
const NO_TRANSITION = 'Reveal.configure({ transition: "none", backgroundTransition: "none" })';

export async function probeDeck(htmlFile, { shots } = {}) {
  const url = pathToFileURL(resolve(htmlFile)).href;
  const browser = await launch();
  try {
    await browser.gotoDeck(url);
    await browser.evaluate(NO_TRANSITION);
    const total = await browser.evaluate('Reveal.getSlides().length');
    if (shots) mkdirSync(shots, { recursive: true });

    const slides = [];
    for (let i = 0; i < total; i++) {
      await browser.evaluate(
        '(function () { var s = Reveal.getSlides()[' + i + ']; var idx = Reveal.getIndices(s); Reveal.slide(idx.h, idx.v, 999); })()'
      );
      await browser.evaluate(SETTLE);
      const facts = await browser.evaluate(PROBE);
      facts.index = i + 1;
      slides.push(facts);
      if (shots) {
        await browser.screenshot(resolve(shots, String(i + 1).padStart(2, '0') + '.png'));
      }
    }

    // Deep link: open a slide in the middle directly and read the header.
    const mid = Math.min(total, Math.max(2, Math.ceil(total / 2)));
    await browser.gotoDeck(url + '#/' + mid);
    await browser.evaluate(NO_TRANSITION);
    await browser.evaluate(SETTLE);
    const deepLink = await browser.evaluate(PROBE);
    deepLink.index = mid;

    return { total, slides, deepLink };
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  const shotsAt = process.argv.indexOf('--shots');
  const shots = shotsAt > -1 ? process.argv[shotsAt + 1] : undefined;
  if (!file) {
    console.error('Usage: node tests/probe.mjs <deck.html> [--shots <dir>]');
    process.exit(2);
  }
  const report = await probeDeck(file, { shots });
  console.log(JSON.stringify(report, null, 2));
}
