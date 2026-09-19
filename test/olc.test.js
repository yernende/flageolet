const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {setupWorld, interpret} = require("./helpers");
const saveWorld = require("../plugins/olc/save");

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "flageolet-olc-"));
  const folder = path.join(directory, "test");
  fs.mkdirSync(folder);
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const area = {id: "test", name: {en: "Test"}, largestRoomId: 3,
    npcs: [{id: "guide", ai: "guide", roomId: 2, name: {en: "guide"}}],
    items: [{id: "sword", roomId: 3, name: {en: "sword"}}]};
  const rooms = [0, 1, 2, 3].map((id) => ({id, name: {en: `Room ${id}`, ru: `Комната ${id}`}, surface: "ground"}));
  const map = rooms.map(({id}) => ({roomId: id, x: id, y: 0, z: 0, exits: []}));
  for (const [file, data] of Object.entries({"area.json": area, "rooms.json": rooms, "map.json": map})) {
    fs.writeFileSync(path.join(folder, file), JSON.stringify(data));
  }
  return {...setupWorld({areasDirectory: directory}), folder};
}

function snapshot(area) {
  return JSON.stringify({area: area.serialize(), rooms: [...area.rooms.values()].map((room) => room.serialize()), map: area.map.map((cell) => cell.serialize())});
}

test("mole validates raw directions and accepts abbreviations and case", async (t) => {
  const {game, makeUser} = fixture(t);
  const area = game.world.areas.get("test");
  const user = makeUser();
  await interpret(user, "mole");
  const before = snapshot(area);
  for (const command of ["go", "go nowhere", "go north extra"]) {
    await interpret(user, command);
    assert.equal(snapshot(area), before, command);
  }
  for (const direction of ["north", "east", "south", "west", "up", "down"]) {
    user.character.move(area.rooms.get(0));
    await interpret(user, `go ${direction[0].toUpperCase()}`);
    assert.notEqual(user.character.location.id, 0, direction);
    assert.equal(area.rooms.get(0).exits.find((exit) => exit.direction === direction).destination, user.character.location);
    assert(area.map.some((cell) => cell.room === user.character.location));
  }
  assert([...area.rooms.values()].every((room) => room.exits.every((exit) => ["north", "east", "south", "west", "up", "down"].includes(exit.direction))));
});

test("editing targets explicit zero, preserves case, and checks IDs before prompting", async (t) => {
  const {game, makeUser} = fixture(t);
  const user = makeUser();
  const area = game.world.areas.get("test");
  user.character.move(area.rooms.get(1));
  assert.match(await interpret(user, "edit room 999"), /no such room/i);
  assert.equal(user.resolveQueryPromise, null);
  const editing = user.interpret("edit room 0");
  await user.interpret("The Upper Hall");
  await user.interpret("Верхний Зал");
  await user.interpret("marble");
  await editing;
  assert.equal(area.rooms.get(0).name.en, "The Upper Hall");
  assert.equal(area.rooms.get(0).name.ru, "Верхний Зал");
  assert.equal(area.rooms.get(1).name.en, "Room 1");
  const currentEditing = user.interpret("edit room");
  await user.interpret("Current Room");
  await user.interpret("");
  await user.interpret("");
  await currentEditing;
  assert.equal(area.rooms.get(1).name.en, "Current Room");
});

test("deletion protects startup references and doors, and relocates players and loose items", async (t) => {
  const {game, makeUser, Item, Room} = fixture(t);
  const area = game.world.areas.get("test");
  const user = makeUser();
  const second = makeUser();
  const room = area.rooms.get(1);
  const looseItem = new Item({name: {en: "pebble"}});
  looseItem.register();
  looseItem.move(room);
  user.character.move(room);
  second.character.move(room);
  for (const id of [0, 2, 3]) {
    assert.match(await interpret(user, `delete room ${id}`), /protected/i);
    assert(area.rooms.has(id));
    assert.equal(user.character.location, room);
  }
  assert.match(await interpret(user, "delete room 999"), /no such room/i);
  const door = new Room.Door({id: "temporary"});
  Room.link(area.rooms.get(0), room, "north", door);
  assert.match(await interpret(user, "delete room 1"), /protected/i);
  area.rooms.get(0).exits = [];
  Room.link(area.rooms.get(0), room, "north");
  assert.match(await interpret(user, "delete room"), /has been deleted/i);
  assert.equal(user.character.location.id, 0);
  assert.equal(second.character.location.id, 0);
  assert.equal(looseItem.location, area.rooms.get(0));
  assert(!area.rooms.has(1));
  assert(!area.map.some((cell) => cell.room.id === 1));
  assert(!area.rooms.get(0).exits.some((exit) => exit.destination.id === 1));
});

test("save awaits staged writes and serializes snapshots without overlapping replacements", async (t) => {
  const {game, folder} = fixture(t);
  const area = game.world.areas.get("test");
  const realWrite = fs.promises.writeFile;
  const realRename = fs.promises.rename;
  let release;
  const blocked = new Promise((resolve) => { release = resolve; });
  let writes = 0;
  let replacements = 0;
  t.mock.method(fs.promises, "writeFile", async (...args) => {
    writes++;
    if (writes <= 3) await blocked;
    return realWrite(...args);
  });
  t.mock.method(fs.promises, "rename", async (...args) => { replacements++; return realRename(...args); });
  area.rooms.get(1).name.en = "First snapshot";
  let completed = false;
  const first = saveWorld().then(() => { completed = true; });
  await new Promise(setImmediate);
  assert.equal(writes, 3);
  assert.equal(replacements, 0);
  assert.equal(completed, false);
  area.rooms.get(1).name.en = "Second snapshot";
  const second = saveWorld();
  area.rooms.get(1).name.en = "Unsaved later edit";
  await new Promise(setImmediate);
  assert.equal(writes, 3);
  release();
  await Promise.all([first, second]);
  assert.equal(replacements, 6);
  assert.equal(JSON.parse(fs.readFileSync(path.join(folder, "rooms.json"))).find((room) => room.id === 1).name.en, "Second snapshot");
  assert(!fs.readdirSync(folder).some((file) => file.endsWith(".tmp")));
});

test("failed staged writes leave originals intact, report failure, and permit a later save", async (t) => {
  const {game, folder, makeUser} = fixture(t);
  const original = fs.readFileSync(path.join(folder, "rooms.json"), "utf8");
  game.world.areas.get("test").rooms.get(1).name.en = "Changed";
  const realWrite = fs.promises.writeFile;
  const mockedWrite = t.mock.method(fs.promises, "writeFile", async (file, ...args) => {
    if (file.includes("rooms.json")) throw new Error("injected disk failure");
    return realWrite(file, ...args);
  });
  t.mock.method(console, "error", () => {});
  const output = await interpret(makeUser(), "save world");
  assert.match(output, /could not be saved/i);
  assert.doesNotMatch(output, /has been saved/i);
  assert.equal(fs.readFileSync(path.join(folder, "rooms.json"), "utf8"), original);
  assert(!fs.readdirSync(folder).some((file) => file.endsWith(".tmp")));
  mockedWrite.mock.restore();
  await saveWorld();
  assert.equal(JSON.parse(fs.readFileSync(path.join(folder, "rooms.json"))).find((room) => room.id === 1).name.en, "Changed");
});

test("replacement failure restores the previous loadable snapshot and the next save succeeds", async (t) => {
  const {game, folder, makeUser} = fixture(t);
  const originals = Object.fromEntries(["area.json", "rooms.json", "map.json"].map((name) =>
    [name, fs.readFileSync(path.join(folder, name), "utf8")]));
  assert.equal(game.world.areas.get("test").rooms.get(1).destroy(), true);
  const realRename = fs.promises.rename;
  let injected = false;
  const mockedRename = t.mock.method(fs.promises, "rename", async (source, destination) => {
    if (!injected && destination === path.join(folder, "map.json")) {
      injected = true;
      throw new Error("injected replacement failure");
    }
    return realRename(source, destination);
  });
  t.mock.method(console, "error", () => {});
  const output = await interpret(makeUser(), "save world");
  assert.match(output, /could not be saved/i);
  assert.doesNotMatch(output, /has been saved/i);
  assert.equal(injected, true);
  for (const [name, contents] of Object.entries(originals)) {
    assert.equal(fs.readFileSync(path.join(folder, name), "utf8"), contents, name);
  }
  assert(!fs.readdirSync(folder).some((file) => /\.(tmp|bak)$/.test(file)));
  mockedRename.mock.restore();
  const restored = setupWorld({areasDirectory: path.dirname(folder)});
  assert(restored.game.world.areas.get("test").rooms.has(1));
  assert.equal(restored.game.world.areas.get("test").rooms.get(1).destroy(), true);
  assert.match(await interpret(restored.makeUser(), "save world"), /has been saved/i);
  const reloaded = setupWorld({areasDirectory: path.dirname(folder)});
  assert(!reloaded.game.world.areas.get("test").rooms.has(1));
  assert(!fs.readdirSync(folder).some((file) => /\.(tmp|bak)$/.test(file)));
});

test("an incomplete rollback retains the full old snapshot as named backups", async (t) => {
  const {game, folder} = fixture(t);
  const originals = Object.fromEntries(["area.json", "rooms.json", "map.json"].map((name) =>
    [name, fs.readFileSync(path.join(folder, name), "utf8")]));
  assert.equal(game.world.areas.get("test").rooms.get(1).destroy(), true);
  const realRename = fs.promises.rename;
  let replacementFailed = false;
  t.mock.method(fs.promises, "rename", async (source, destination) => {
    if (destination === path.join(folder, "map.json")) {
      replacementFailed = true;
      throw new Error("injected replacement failure");
    }
    if (replacementFailed && destination === path.join(folder, "rooms.json")) {
      throw new Error("injected rollback failure");
    }
    return realRename(source, destination);
  });
  await assert.rejects(saveWorld(), (error) => {
    assert(error instanceof AggregateError);
    assert.equal(error.errors.length, 2);
    assert.match(error.message, /rollback was incomplete.*Backups retained:/);
    for (const name of Object.keys(originals)) assert(error.message.includes(path.join(folder, name)));
    return true;
  });
  const backups = fs.readdirSync(folder).filter((file) => file.endsWith(".bak"));
  assert.equal(backups.length, 3);
  for (const [name, contents] of Object.entries(originals)) {
    const backup = backups.find((file) => file.startsWith(`${name}.`));
    assert(backup, name);
    assert.equal(fs.readFileSync(path.join(folder, backup), "utf8"), contents, name);
  }
  assert(!fs.readdirSync(folder).some((file) => file.endsWith(".tmp")));
});
