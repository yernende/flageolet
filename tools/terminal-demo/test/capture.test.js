const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {root} = require('../common');
const {captureScenario} = require('../capture');
const {serve} = require('../preview');
const scenarios = require('../scenarios');

async function temporary(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'terminal-capture-test-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  return directory;
}

async function worldDigest() {
  const hash = createHash('sha256');
  const directory = path.join(root, 'areas');
  for (const file of (await fs.readdir(directory, {recursive: true})).sort()) {
    if (file.endsWith('.json')) hash.update(file).update(await fs.readFile(path.join(directory, file)));
  }
  return hash.digest('hex');
}

test('both real scenarios record the world without changing it; preview works after server cleanup', {timeout: 30000}, async t => {
  const output = await temporary(t);
  const before = await worldDigest();
  for (const name of ['map', 'quest']) {
    const metadata = await captureScenario(name, {output});
    assert.equal(metadata.status, 'success');
    const frame = await fs.readFile(path.join(output, name, 'frame.ansi'), 'utf8');
    assert.ok(frame.startsWith('> '));
    assert.match(frame, /\x1b\[/);
    assert.ok(frame.includes(name === 'map' ? 'Old timbers creak' : 'This key unlocks'));
    const raw = await fs.readFile(path.join(output, name, 'server.ansi'), 'utf8');
    assert.match(raw, /Алтарь храма/);
    assert.doesNotMatch(raw, /give sword guard/);
    assert.equal(await fs.readFile(path.join(output, name, 'server.stderr.log'), 'utf8'), '');
  }
  assert.equal(await worldDigest(), before);
  const preview = await serve({output});
  t.after(preview.close);
  assert.deepEqual((await (await fetch(preview.url + '/recordings.json')).json()).sort(), ['map', 'quest']);
  assert.match(await (await fetch(preview.url + '/recordings/map/frame.ansi')).text(), /Old timbers/);
  assert.equal((await fetch(preview.url + '/fonts/regular.woff2')).status, 200);
  assert.equal((await fetch(preview.url + '/recordings/map/server.ansi')).status, 404);
  assert.equal((await fetch(preview.url + '/package.json')).status, 404);
});

test('failed captures invalidate old frames and leave useful diagnostic artifacts', {timeout: 10000}, async t => {
  const output = await temporary(t);
  const directory = path.join(output, 'quest');
  await fs.mkdir(directory);
  await fs.writeFile(path.join(directory, 'frame.ansi'), 'stale successful frame');
  await fs.writeFile(path.join(directory, 'dialogue-demo.png'), 'stale PNG');
  const scenario = {...scenarios.quest, setup: [], frame: [{command: 'look', expect: 'This cannot occur'}]};
  await assert.rejects(captureScenario('quest', {output, scenario, timeoutMs: 500}), /Timed out/);
  const metadata = JSON.parse(await fs.readFile(path.join(directory, 'metadata.json'), 'utf8'));
  assert.equal(metadata.status, 'failed');
  assert.match(metadata.error, /This cannot occur/);
  assert.match(await fs.readFile(path.join(directory, 'session.ansi'), 'utf8'), /look/);
  await assert.rejects(fs.access(path.join(directory, 'frame.ansi')), {code: 'ENOENT'});
  await assert.rejects(fs.access(path.join(directory, 'dialogue-demo.png')), {code: 'ENOENT'});
  const preview = await serve({output});
  t.after(preview.close);
  assert.deepEqual(await (await fetch(preview.url + '/recordings.json')).json(), []);
});
