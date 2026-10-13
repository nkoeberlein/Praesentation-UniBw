// Exports a rendered deck as PDF, one page per slide, via Revealjs's print view.
//   node tests/export-pdf.mjs demo.html [demo.pdf]

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';

const PRINT_READY =
  'new Promise(function (resolve, reject) {' +
  '  var start = Date.now();' +
  '  (function wait() {' +
  '    if (document.querySelector(".reveal .slides .pdf-page")) return resolve(true);' +
  '    if (Date.now() - start > 20000) return reject(new Error("Print view not ready after 20 s"));' +
  '    setTimeout(wait, 100);' +
  '  })();' +
  '})';

export async function exportPdf(htmlFile, pdfFile) {
  const browser = await launch();
  try {
    await browser.gotoDeck(pathToFileURL(resolve(htmlFile)).href + '?print-pdf');
    await browser.evaluate(PRINT_READY);
    // One more frame so header/footer copies and auto-fit of the print view are in place
    await browser.evaluate('new Promise(function (r) { setTimeout(r, 400); })');
    const size = await browser.evaluate(
      '({ width: Reveal.getConfig().width, height: Reveal.getConfig().height, pages: document.querySelectorAll(".pdf-page").length })'
    );
    await browser.pdf(resolve(pdfFile), { widthPx: size.width, heightPx: size.height });
    return size.pages;
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const html = process.argv[2];
  if (!html) {
    console.error('Usage: node tests/export-pdf.mjs <deck.html> [out.pdf]');
    process.exit(2);
  }
  const out = process.argv[3] || html.replace(/\.html$/, '.pdf');
  const pages = await exportPdf(html, out);
  console.log(out + ': ' + pages + ' Seiten');
}
