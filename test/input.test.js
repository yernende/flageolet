const test = require("node:test");
const assert = require("node:assert/strict");
const Command = require("../src/command");
const {setupWorld, interpret, stripAnsi} = require("./helpers");

async function drain(user) {
  while (user.input.length) await user.handleInput();
  return stripAnsi(user.output.join(""));
}

test("TCP input queues complete LF/CRLF lines and decodes fragmented UTF-8", async () => {
  const {makeUser} = setupWorld();
  const user = makeUser();
  const observer = makeUser();
  const bytes = Buffer.from("SaY Привет, Мир!\r\nsay Second Line\nsay unfinished");
  const split = Buffer.from("SaY ").length + 1;
  user.receive(bytes.subarray(0, split));
  assert.equal(user.input.length, 0);
  user.receive(bytes.subarray(split, bytes.length - 2));
  user.receive(bytes.subarray(bytes.length - 2));
  assert.equal(user.input.length, 2);
  assert.equal(user.inputBuffer, "say unfinished");
  const output = await drain(user);
  assert.match(output, /Привет, Мир!/);
  assert.match(output, /Second Line/);
  assert.doesNotMatch(output, /unfinished/);
  assert.match(stripAnsi(observer.output.join("")), /Привет, Мир!/);
  user.receive(Buffer.from(" Message\r"));
  assert.equal(user.input.length, 0);
  user.receive(Buffer.from("\n"));
  assert.match(await drain(user), /unfinished Message/);
});

test("dialogue requires whole numbers, repeats on either newline and remains per player", async () => {
  const {makeUser} = setupWorld();
  const english = makeUser();
  const russian = makeUser("ru");
  assert.match(await interpret(english, "TaLk ACOLYTE"), /What would you like to know/);
  assert.match(await interpret(russian, "talk"), /О чём ты хочешь узнать/);
  for (const answer of ["1abc", "1.5", "-1", "0", "99"]) {
    assert.match(await interpret(english, answer), /Enter one of the answer numbers/);
  }
  for (const newline of ["\n", "\r\n"]) {
    english.output = [];
    english.receive(Buffer.from(newline));
    assert.match(await drain(english), /What would you like to know/);
  }
  assert.match(await interpret(english, "2"), /Ask the guard/);
  assert.match(await interpret(english, "1"), /western garden/);
  assert.match(await interpret(english, "2"), /What would you like to know/);
  assert.match(await interpret(russian, "1"), /Этот алтарь/);
  await interpret(english, "3");
  await interpret(russian, "3");
  assert.equal(english.dialog, null);
  assert.equal(russian.dialog, null);
  assert.match(await interpret(english, "LOOK"), /Temple Altar/);
  assert.match(await interpret(russian, "say Всё Работает"), /Всё Работает/);
});

test("optional parameters and case-insensitive lookup preserve supplied names", async () => {
  const {makeUser} = setupWorld();
  const user = makeUser();
  const command = new Command({pattern: "example room <number?>", action() {}});
  assert.deepEqual(command.argument.exec("ROOM", user), [null]);
  assert.deepEqual(command.argument.exec("room 0", user), [0]);
  const prompt = user.interpret("EDIT ROOM 0");
  await user.interpret("The Quiet Altar");
  await user.interpret("Тихий Алтарь");
  await user.interpret("");
  await prompt;
  assert.equal(user.character.location.name.en, "The Quiet Altar");
  assert.equal(user.character.location.name.ru, "Тихий Алтарь");
  await interpret(user, "LANGUAGE EN");
  assert.equal(user.language, "en");
  await interpret(user, "north");
  await interpret(user, "west");
  await interpret(user, 'GET "RUSTY SWORD"');
  assert.equal(user.character.inventory.items.length, 1);
});

test("disconnect cancels interactive input and drops inventory once in the last room", async () => {
  const {makeUser, game} = setupWorld();
  const user = makeUser();
  const observer = makeUser();
  await interpret(user, "north");
  await interpret(user, "west");
  await interpret(user, "get sword");
  const room = user.character.location;
  const item = user.character.inventory.items[0];
  user.receive(Buffer.from("edit room\n"));
  const editing = user.handleInput();
  assert.equal(typeof user.resolveQueryPromise, "function");
  user.destroy();
  user.destroy();
  await editing;
  assert.equal(user.rejectQueryPromise, null);
  assert.equal(user.resolveQueryPromise, null);
  assert.equal(user.connection.destroyed, true);
  assert.equal(user.character.location, null);
  assert.equal(game.world.characters.has(user.character.id), false);
  assert.deepEqual(game.users, [observer]);
  assert.equal(item.location, room);
  assert.equal(room.items.filter((candidate) => candidate === item).length, 1);
  assert.equal(user.character.inventory.items.length, 0);
  user.receive(Buffer.from("look\n"));
  assert.equal(user.input.length, 0);
});

test("asynchronous command and dialogue errors are caught by the input loop", async (t) => {
  const {makeUser, game} = setupWorld();
  const user = makeUser();
  const logged = [];
  t.mock.method(console, "error", (error) => logged.push(error));
  game.commands.unshift(new Command({pattern: "fail", async action() {
    await Promise.resolve();
    throw new Error("command failure");
  }}));
  user.receive(Buffer.from("fail\nlook\n"));
  assert.match(await drain(user), /Temple Altar/);
  assert.equal(logged[0].message, "command failure");
  assert.equal(user.closed, false);
  user.dialog = {answers: [{en: "Fail", async handler() {throw new Error("dialogue failure");}}]};
  user.receive(Buffer.from("1\n"));
  await drain(user);
  assert.equal(logged[1].message, "dialogue failure");
  assert.equal(user.dialog, null);
  await interpret(user, "q");
  assert.equal(user.closed, false);
  await interpret(user, "QUIT");
  assert.equal(user.closed, true);
});

test("EOF executes queued complete lines, flushes output, and ignores an unfinished fragment", async () => {
  const {makeUser} = setupWorld();
  const user = makeUser();
  const observer = makeUser();
  user.receive(Buffer.from("say First EOF message\r\nsay Second EOF message\nsay unfinished"));
  user.endInput();
  assert.equal(user.closed, false);
  assert.equal(user.inputBuffer, "");
  user.receive(Buffer.from("ignored after EOF\n"));
  assert.equal(user.input.length, 2);
  await drain(user);
  assert.equal(user.closed, true);
  const sent = stripAnsi(user.connection.sent.join(""));
  assert.match(sent, /First EOF message/);
  assert.match(sent, /Second EOF message/);
  assert.doesNotMatch(sent, /unfinished|ignored after EOF/);
  assert.match(stripAnsi(observer.output.join("")), /Second EOF message/);
});

test("EOF waits for ordinary asynchronous commands before graceful shutdown", async () => {
  const {makeUser, game} = setupWorld();
  const user = makeUser();
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  game.commands.unshift(new Command({pattern: "slow", async action() {
    await waiting;
    this.xterm.writeln("Asynchronous command complete.");
  }}));
  user.connection.end = function() { this.ended = true; };
  user.receive(Buffer.from("slow\n"));
  user.endInput();
  const running = user.handleInput();
  assert.equal(user.closed, false);
  assert.equal(user.pendingCommands, 1);
  release();
  await running;
  assert.equal(user.closed, true);
  assert.equal(user.pendingCommands, 0);
  assert.equal(user.connection.ended, true);
  assert.equal(user.connection.destroyed, false);
  assert.match(stripAnsi(user.connection.sent.join("")), /Asynchronous command complete/);
});

test("EOF cancels an editor when its queued replies run out", {timeout: 1000}, async () => {
  const {makeUser} = setupWorld();
  const user = makeUser();
  const room = user.character.location;
  const originalName = {...room.name};
  user.receive(Buffer.from("edit room 0\nUnfinished Edit\n"));
  user.endInput();
  const editing = user.handleInput();
  assert.equal(user.closed, false);
  assert.equal(typeof user.resolveQueryPromise, "function");
  const reply = user.handleInput();
  await Promise.all([editing, reply]);
  assert.equal(user.closed, true);
  assert.equal(user.pendingCommands, 0);
  assert.equal(user.resolveQueryPromise, null);
  assert.equal(user.rejectQueryPromise, null);
  assert.deepEqual(room.name, originalName);
  assert.match(stripAnsi(user.connection.sent.join("")), /Russian/);
});

test("cancelling an EOF prompt still waits for another asynchronous command", {timeout: 1000}, async () => {
  const {makeUser, game} = setupWorld();
  const user = makeUser();
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  game.commands.unshift(new Command({pattern: "slow", async action() {
    await waiting;
    this.xterm.writeln("Earlier asynchronous command complete.");
  }}));
  user.receive(Buffer.from("slow\nedit room 0\n"));
  user.endInput();
  const slow = user.handleInput();
  const editing = user.handleInput();
  await editing;
  assert.equal(user.closed, false);
  assert.equal(user.pendingCommands, 1);
  assert.equal(user.resolveQueryPromise, null);
  release();
  await slow;
  assert.equal(user.closed, true);
  assert.match(stripAnsi(user.connection.sent.join("")), /Earlier asynchronous command complete/);
});

test("EOF allows a complete queued editor conversation and the following command", {timeout: 1000}, async () => {
  const {makeUser} = setupWorld();
  const user = makeUser();
  const room = user.character.location;
  user.receive(Buffer.from("edit room 0\nThe Quiet Altar\nТихий Алтарь\n\nsay Edit Finished\n"));
  user.endInput();
  const commands = [];
  while (user.input.length) {
    commands.push(user.handleInput());
    await new Promise(setImmediate);
  }
  await Promise.all(commands);
  assert.equal(user.closed, true);
  assert.equal(room.name.en, "The Quiet Altar");
  assert.equal(room.name.ru, "Тихий Алтарь");
  assert.match(stripAnsi(user.connection.sent.join("")), /Edit Finished/);
});
