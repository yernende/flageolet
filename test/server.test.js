const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const {spawn} = require("node:child_process");
const {once, EventEmitter} = require("node:events");
const {root, stripAnsi} = require("./helpers");

function until(emitter, event, predicate, description) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error(`Timed out: ${description}`)), 7000);
    function finish(error, result) {
      clearTimeout(timer);
      emitter.off(event, check);
      error ? reject(error) : resolve(result);
    }
    function check() {
      const result = predicate();
      if (result) finish(null, result);
    }
    emitter.on(event, check);
    check();
  });
}

async function startServer(t, directory) {
  const child = spawn(process.execPath, [path.join(root, "index.js")], {
    cwd: root, env: {...process.env, PORT: "0", WORLD_DIR: directory}, stdio: ["ignore", "pipe", "pipe"]
  });
  let stdout = "", stderr = "";
  child.stdout.on("data", (chunk) => {stdout += chunk;});
  child.stderr.on("data", (chunk) => {stderr += chunk;});
  async function stop() {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exited = once(child, "exit");
    child.kill();
    await exited;
  }
  t.after(stop);
  const match = await until(child.stdout, "data", () => /listening on port (\d+)/.exec(stdout), "server ready");
  return {port: Number(match[1]), stop, errors: () => stderr};
}

async function connect(t, port) {
  const socket = net.createConnection({port, host: "127.0.0.1"});
  socket.setEncoding("utf8");
  const events = new EventEmitter();
  let output = "";
  socket.on("data", (chunk) => {output += stripAnsi(chunk); events.emit("output");});
  socket.on("error", (error) => {output += error.message; events.emit("output");});
  t.after(() => socket.destroy());
  await until(events, "output", () => output.includes("> "), "initial room");
  return {
    socket,
    output: () => output,
    async send(command, expected) {
      const offset = output.length;
      socket.write(command);
      return this.wait(expected, offset);
    },
    wait(expected, offset = 0) {
      return until(events, "output", () => {
        const received = output.slice(offset);
        return expected.test(received) && received;
      }, `response ${expected}`);
    }
  };
}

test("real TCP clients complete the quest, edit a temporary world and survive reconnect/restart", {timeout: 30000}, async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "flageolet-server-"));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  await fs.cp(path.join(root, "areas"), directory, {recursive: true});
  const server = await startServer(t, directory);
  const first = await connect(t, server.port);
  const second = await connect(t, server.port);
  assert.match(first.output(), /Алтарь храма/);
  await first.send("language EN\r\n", /Language switched/);
  await second.send("language en\n", /Language switched/);

  const offset = second.output().length;
  const text = Buffer.from("SaY Привет, Мир! $message\r\n");
  first.socket.write(text.subarray(0, 5)); // Split the first Cyrillic code point.
  first.socket.write(text.subarray(5, 11));
  first.socket.write(text.subarray(11));
  assert.match(await second.wait(/Привет, Мир! \$message/, offset), /Привет, Мир! \$message/);

  await first.send("talk acolyte\n2\r\n1\n2\n3\nlook\n", /Temple Altar/);
  await first.send("north\nwest\nget sword\neast\nnorth\ntalk guard\n2\ngive sword guard\n", /This key unlocks the northern gates/);
  await second.send("north\nnorth\nopen north\n", /You do not have the key/);
  await first.send("open north\n", /You open the temple gates/);
  await second.send("north\nclose south\n", /You close the temple gates/);
  await first.send("close north\n", /That door is already closed/);
  await second.send("open south\n", /You open the temple gates/);
  await first.send("north\n", /Woodland Edge/);
  const beforeDrop = second.output().length;
  first.socket.end();
  await second.wait(/leaves the game/, beforeDrop);
  await second.send("get key\ninventory\n", /big steel key/);

  // EOF must drain full commands, cancel an unanswered editor and discard a fragment.
  const eof = await connect(t, server.port);
  await second.send("recall\n", /Temple Altar/);
  const beforeEOF = second.output().length;
  const closed = once(eof.socket, "close");
  eof.socket.end("say EOF Complete\nedit room\nsay Incomplete");
  await second.wait(/EOF Complete/, beforeEOF);
  await closed;
  assert.doesNotMatch(second.output().slice(beforeEOF), /Incomplete/);

  // Authoring survives a new process; runtime quest/key/door state does not.
  await second.send("edit room 0\nRenamed Altar\nНовый Алтарь\n\nsave world\n", /The world has been saved/);
  const rooms = JSON.parse(await fs.readFile(path.join(directory, "flageolet/rooms.json")));
  assert.equal(rooms.find((room) => room.id === 0).name.en, "Renamed Altar");
  assert.equal(server.errors(), "");
  second.socket.destroy();
  await server.stop();

  const restarted = await startServer(t, directory);
  const fresh = await connect(t, restarted.port);
  assert.match(fresh.output(), /Новый Алтарь/);
  await fresh.send("language en\nnorth\nwest\nget sword\neast\nnorth\nopen north\n", /You do not have the key/);
  await fresh.send("give sword guard\n", /This key unlocks the northern gates/);
  assert.equal(restarted.errors(), "");
});
