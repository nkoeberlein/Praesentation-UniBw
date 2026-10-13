// Minimal Chrome DevTools Protocol client without dependencies (Node >= 22).
// Starts a headless Chrome, opens one page and exposes evaluate/screenshot/pdf.

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function waitForPort(proc) {
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('Chrome did not start within 15 s')), 15000);
    proc.stderr.on('data', (chunk) => {
      buf += chunk;
      const m = buf.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//);
      if (m) {
        clearTimeout(timer);
        resolve(Number(m[1]));
      }
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error('Cannot start Chrome (' + CHROME + '): ' + err.message));
    });
  });
}

export async function launch({ width = 1920, height = 1080 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'ubw-chrome-'));
  const proc = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    '--window-size=' + width + ',' + height,
    '--hide-scrollbars',
    '--no-first-run',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const port = await waitForPort(proc);
  const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const target = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('Cannot connect to Chrome'));
  });

  let nextId = 0;
  const pending = new Map();
  const waiters = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method && waiters.has(msg.method)) {
      const list = waiters.get(msg.method);
      waiters.delete(msg.method);
      list.forEach((fn) => fn(msg.params));
    }
  };

  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function once(event) {
    return new Promise((resolve) => {
      if (!waiters.has(event)) waiters.set(event, []);
      waiters.get(event).push(resolve);
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      const d = res.exceptionDetails;
      throw new Error('Page error: ' + (d.exception && d.exception.description || d.text));
    }
    return res.result.value;
  }

  async function goto(url) {
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url });
    await loaded;
  }

  // Loads a URL and waits until Revealjs reports ready. Goes through a blank
  // page first so that a URL differing only in its hash still reloads.
  async function gotoDeck(url) {
    await goto('about:blank');
    await goto(url);
    await evaluate(
      'new Promise(function (resolve, reject) {' +
      '  var start = Date.now();' +
      '  (function wait() {' +
      '    if (Date.now() - start > 20000) return reject(new Error("Reveal not ready after 20 s"));' +
      '    if (typeof Reveal === "undefined") return setTimeout(wait, 50);' +
      '    if (Reveal.isReady()) return resolve(true);' +
      '    Reveal.on("ready", function () { resolve(true); });' +
      '  })();' +
      '})'
    );
  }

  async function screenshot(file) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(file, Buffer.from(res.data, 'base64'));
  }

  async function pdf(file, { widthPx, heightPx }) {
    const res = await send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      paperWidth: widthPx / 96,
      paperHeight: heightPx / 96,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
    writeFileSync(file, Buffer.from(res.data, 'base64'));
  }

  async function close() {
    ws.close();
    proc.kill();
    await new Promise((resolve) => proc.on('exit', resolve));
    rmSync(profile, { recursive: true, force: true });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: false,
  });

  return { send, evaluate, gotoDeck, screenshot, pdf, close };
}
