const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const {outputDirectory, selection} = require('./common');
const {serve} = require('./preview');

async function render(names, {output = outputDirectory} = {}) {
  // Imported only for export; capture, preview and node:test never start a browser.
  const {chromium} = require('playwright');
  const server = await serve({output});
  let browser;
  try {
    browser = await chromium.launch({headless: true});
    const page = await browser.newPage({viewport: {width: 1280, height: 720}, deviceScaleFactor: 1});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const checks = [];
    for (const name of names) {
      const directory = path.join(output, name);
      const metadata = JSON.parse(await fs.readFile(path.join(directory, 'metadata.json'), 'utf8'));
      assert.equal(metadata.status, 'success', `Capture ${name} did not succeed`);
      assert.match(metadata.filename, /^[a-z0-9-]+\.png$/);
      const target = path.join(directory, metadata.filename);
      await fs.rm(target, {force: true});
      await page.goto(`${server.url}/?scenario=${name}&export=1`);
      await page.waitForFunction(() => document.body.dataset.ready === 'true' || window.demoError);
      const result = await page.evaluate(() => ({...window.demoResult, error: window.demoError}));
      assert.equal(result.error, undefined, result.error);
      assert.deepEqual(errors, [], 'Browser errors');
      assert.equal(result.fontsLoaded, true, 'Bundled fonts did not load');
      assert.equal(result.scrolled, false, 'Frame exceeds the configured terminal rows');
      assert.equal(result.clipped, false, 'Frame is clipped');
      for (const expected of result.visibleText) assert.ok(result.text.includes(expected), `Missing visible text: ${expected}`);
      assert.doesNotMatch(result.text, /lorem ipsum|\uFFFD/i);
      assert.match(result.text, /[│┃]/, 'Missing box drawing');
      const png = await page.screenshot({path: target, animations: 'disabled'});
      assert.equal(png.readUInt32BE(16), 1280);
      assert.equal(png.readUInt32BE(20), 720);
      // Exercise Cyrillic and box drawing with the same loaded terminal/font,
      // after the real screenshot has been saved. This is only a render check.
      const sample = 'Алтарь храма · Привет, мир! ┌─┐│└┘';
      const rendered = await page.evaluate(async text => {
        window.demoTerminal.reset();
        await new Promise(resolve => window.demoTerminal.write(text, resolve));
        return window.demoTerminal.buffer.active.getLine(0).translateToString(true);
      }, sample);
      assert.equal(rendered, sample);
      checks.push({scenario: name, commit: metadata.commit, width: 1280, height: 720, fontsLoaded: true, clipped: false});
      console.log(`Rendered ${target}`);
    }
    await fs.writeFile(path.join(output, 'render-checks.json'), JSON.stringify(checks, null, 2) + '\n');
  } finally {
    await browser?.close();
    await server.close();
  }
}

if (require.main === module) {
  (async () => render(selection()))().catch(error => { console.error(error); process.exitCode = 1; });
}

module.exports = {render};
