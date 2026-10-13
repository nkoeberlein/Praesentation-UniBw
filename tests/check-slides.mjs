// Checks a rendered deck against the layout rules of the template.
//   node tests/check-slides.mjs demo.html [--date 01.04.2026]
//        [--expect-overflow id1,id2] [--expect-fit id1,id2]
// Exit code 1 if a rule is broken.

import { probeDeck } from './probe.mjs';

function option(name) {
  const at = process.argv.indexOf('--' + name);
  return at > -1 ? process.argv[at + 1] : undefined;
}

function list(name) {
  const value = option(name);
  return value ? value.split(',') : [];
}

const CONTENT = (s) => /\bslide\b/.test(s.classes) && !/\b(title-slide|end-slide)\b/.test(s.classes) || s.id === 'TOC';
const CANVAS_HEIGHT = 1080;
const WIDTH_TOLERANCE = 0.03;

export function checkDeck(report, { date, expectOverflow = [], expectFit = [] } = {}) {
  const problems = [];
  const fail = (slide, message) => problems.push('Folie ' + slide.index + ' (' + (slide.id || '–') + '): ' + message);

  for (const slide of report.slides) {
    if (slide.transform) fail(slide, 'inline transform "' + slide.transform + '"');

    const numText = String(slide.index) + ' / ' + report.total;
    if (!slide.footerNum || !slide.footerNum.endsWith(numText)) {
      fail(slide, 'Foliennummer "' + slide.footerNum + '" statt "… ' + numText + '"');
    }
    if (date && slide.footerDate !== date) fail(slide, 'Datum "' + slide.footerDate + '" statt "' + date + '"');
    if (slide.headerShown && slide.headerTitle !== slide.expectedSection) {
      fail(slide, 'Abschnitt im Header "' + slide.headerTitle + '" statt "' + slide.expectedSection + '"');
    }

    for (const row of slide.columns) {
      const declared = row.map((c) => c.declared);
      if (declared.some((d) => d === null)) continue;
      const declaredSum = declared.reduce((a, b) => a + b, 0);
      const actualSum = row.reduce((a, c) => a + c.actual, 0);
      row.forEach((c, i) => {
        const want = c.declared / declaredSum;
        const got = c.actual / actualSum;
        if (Math.abs(want - got) > WIDTH_TOLERANCE) {
          fail(slide, 'Spalte ' + (i + 1) + ': ' + (got * 100).toFixed(1) + ' % statt ' + (want * 100).toFixed(1) + ' %');
        }
      });
    }

    if (!CONTENT(slide)) continue;

    if (slide.clientHeight !== CANVAS_HEIGHT) fail(slide, 'Höhe ' + slide.clientHeight + ' statt ' + CANVAS_HEIGHT);
    if (slide.contentTop !== null && slide.contentTop < slide.headerBottom - 1) {
      fail(slide, 'Inhalt beginnt unter dem Header (' + Math.round(slide.contentTop) + ' < ' + Math.round(slide.headerBottom) + ')');
    }

    const mustOverflow = expectOverflow.includes(slide.id);
    if (mustOverflow && !slide.overflow) fail(slide, 'sollte als Überlauf markiert sein');
    if (!mustOverflow) {
      if (slide.overflow) fail(slide, 'als Überlauf markiert');
      if (slide.scrollHeight > slide.clientHeight + 1) {
        fail(slide, 'Inhalt läuft über (' + slide.scrollHeight + ' > ' + slide.clientHeight + ')');
      }
      if (slide.contentBottom !== null && slide.contentBottom > slide.footerTop + 1) {
        fail(slide, 'Inhalt reicht in den Footer (' + Math.round(slide.contentBottom) + ' > ' + Math.round(slide.footerTop) + ')');
      }
    }
    if (expectFit.includes(slide.id) && !(Number(slide.fit) < 1)) {
      fail(slide, 'sollte verkleinert sein (fit = ' + slide.fit + ')');
    }
  }

  // Slide titles have one size, whatever density, .smaller and auto-fit do
  const titled = report.slides.filter((s) => CONTENT(s) && s.titleSize !== null);
  const sizes = [...new Set(titled.map((s) => Math.round(s.titleSize)))];
  if (sizes.length > 1) {
    const reference = Math.round(titled[0].titleSize);
    titled.filter((s) => Math.round(s.titleSize) !== reference)
      .forEach((s) => fail(s, 'Folientitel ' + s.titleSize.toFixed(1) + ' px statt ' + reference + ' px'));
  }

  const endSlides = report.slides.filter((s) => /\bend-slide\b/.test(s.classes));
  if (endSlides.length > 1) problems.push(endSlides.length + ' Abschlussfolien statt höchstens einer');

  for (const id of [...expectOverflow, ...expectFit]) {
    if (!report.slides.some((s) => s.id === id)) problems.push('Folie mit id "' + id + '" fehlt im Deck');
  }

  const deep = report.deepLink;
  if (deep.hash !== '#/' + deep.index) problems.push('Direktsprung: Hash "' + deep.hash + '" statt "#/' + deep.index + '"');
  if (deep.headerShown && deep.headerTitle !== deep.expectedSection) {
    problems.push('Direktsprung auf Folie ' + deep.index + ': Header "' + deep.headerTitle + '" statt "' + deep.expectedSection + '"');
  }

  return problems;
}

const file = process.argv[2];
if (!file || file.startsWith('--')) {
  console.error('Usage: node tests/check-slides.mjs <deck.html> [--date DD.MM.YYYY] [--expect-overflow ids] [--expect-fit ids]');
  process.exit(2);
}

const report = await probeDeck(file);
const problems = checkDeck(report, {
  date: option('date'),
  expectOverflow: list('expect-overflow'),
  expectFit: list('expect-fit'),
});

if (problems.length) {
  console.error(file + ': ' + problems.length + ' Problem(e)');
  problems.forEach((p) => console.error('  ✗ ' + p));
  process.exit(1);
}
console.log(file + ': ' + report.total + ' Folien geprüft, alles in Ordnung');
