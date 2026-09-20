const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {once} = require('node:events');
const {Session} = require('../session');
const {startServer} = require('../server');
const {selection} = require('../common');

async function fakeServer(t, handler) {
  const clients = new Set();
  const server = net.createServer(socket => {
    clients.add(socket);
    socket.on('error', () => {});
    socket.on('close', () => clients.delete(socket));
    handler(socket);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => {
    for (const socket of clients) socket.destroy();
    server.close(resolve);
  }));
  return server.address().port;
}

test('TCP chunks preserve split UTF-8 and ANSI; responses require text and a complete prompt', async t => {
  const welcome = Buffer.from('\x1b[38;5;40mАлтарь храма\x1b[m\n\r> ');
  let received = '';
  const port = await fakeServer(t, socket => {
    let index = 0;
    const sendByte = () => {
      if (socket.destroyed || index === welcome.length) return;
      socket.write(welcome.subarray(index, ++index));
      setImmediate(sendByte);
    };
    sendByte();
    socket.on('data', bytes => {
      received += bytes.toString();
      socket.write('Look completed\n\r');
      setImmediate(() => socket.write('> '));
    });
  });
  const session = new Session(port);
  t.after(() => session.close());
  assert.deepEqual(await session.wait('Алтарь храма'), welcome);
  assert.equal((await session.send({command: 'look', expect: 'Look completed'})).toString(), 'Look completed\n\r> ');
  assert.equal(received, 'look\n');
  assert.deepEqual(Buffer.concat(session.raw), Buffer.concat([welcome, Buffer.from('Look completed\n\r> ')]));
  assert.ok(Buffer.concat(session.transcript).includes(Buffer.from('> look\r\nLook completed')));
});

test('matching text without a prompt times out and removes its waiter', async t => {
  const port = await fakeServer(t, socket => socket.write('Ready without prompt'));
  const session = new Session(port, {timeoutMs: 150});
  t.after(() => session.close());
  await assert.rejects(session.wait('Ready'), /Timed out/);
  assert.equal(session.listenerCount('progress'), 0);
});

test('connection closure rejects a pending response', async t => {
  const port = await fakeServer(t, socket => socket.end('Incomplete'));
  const session = new Session(port);
  t.after(() => session.close());
  await assert.rejects(session.wait('Expected'), /connection closed/);
});

test('abort cancels an input wait promptly', async t => {
  const port = await fakeServer(t, () => {});
  const controller = new AbortController();
  const session = new Session(port, {signal: controller.signal});
  t.after(() => session.close());
  const waiting = session.wait('Expected');
  controller.abort(new Error('Capture cancelled'));
  await assert.rejects(waiting, /Capture cancelled/);
  assert.equal(session.listenerCount('progress'), 0);
});

async function fixture(t, source) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'terminal-demo-test-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const entry = path.join(directory, 'fixture.cjs');
  const worldSource = path.join(directory, 'areas');
  await fs.mkdir(worldSource);
  await fs.writeFile(path.join(worldSource, 'sentinel.json'), '{}');
  await fs.writeFile(entry, source);
  return {entry, worldSource};
}

test('server stop reaps even an uncooperative child and removes its temporary world', async t => {
  const options = await fixture(t, `
    process.on('SIGTERM', () => {});
    console.log('Flageolet listening on port 12345.');
    setInterval(() => {}, 1000);
  `);
  const server = await startServer(options);
  t.after(server.stop);
  await fs.access(path.join(server.directory, 'world/sentinel.json'));
  await server.stop();
  assert.equal(server.child.signalCode, 'SIGKILL');
  await assert.rejects(fs.access(server.directory), {code: 'ENOENT'});
  await server.stop();
});

test('startup failure and timeout both clean their copied worlds and retain logs', async t => {
  for (const ending of ["console.error('broken startup'); process.exit(2);", 'setInterval(() => {}, 1000);']) {
    const options = await fixture(t, `console.log(process.env.WORLD_DIR); ${ending}`);
    const logs = {stdout: '', stderr: ''};
    await assert.rejects(startServer({...options, logs, timeoutMs: 250}), /startup/);
    await assert.rejects(fs.access(path.dirname(logs.stdout.trim())), {code: 'ENOENT'});
    if (ending.includes('process.exit')) assert.match(logs.stderr, /broken startup/);
  }
});

test('scenario selection rejects unknown flags and scene names', () => {
  assert.deepEqual(selection([]), ['map', 'quest']);
  assert.deepEqual(selection(['--scenario', 'quest']), ['quest']);
  assert.throws(() => selection(['--scenario', '../other']), /must be/);
  assert.throws(() => selection(['--host', 'public.example']), /Unknown option/);
});
