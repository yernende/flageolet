const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {setupWorld, interpret} = require("./helpers");
const game = require("../src/game");
const saveWorld = require("../plugins/olc/save");

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "flageolet-world-"));
  const folder = path.join(directory, "test");
  fs.mkdirSync(folder);
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const area = {id: "test", name: {en: "Test world"}, largestRoomId: 3,
    npcs: [
      {id: "guide", ai: "guide", roomId: 0, name: {en: "acolyte", ru: "аколит"}},
      {id: "guard", ai: "guard", roomId: 2, name: {en: "guard", ru: "стражник"}, quest: {swordItemId: "sword", keyItemId: "key"}},
      {id: "bird", ai: "bird", roomId: 3, name: {en: "bird", ru: "птица"}}
    ],
    items: [
      {id: "sword", name: {en: "sword"}, roomId: 1},
      {id: "key", name: {en: "key"}, npcId: "guard"},
      {id: "boat", name: {en: "boat"}, type: "boat", roomId: 3}
    ],
    doors: [{id: "gate", name: {en: "gate", ru: "ворота"}, closed: true, locked: true, keyItemId: "key"}]
  };
  const rooms = [0, 1, 2, 3].map((id) => ({id, name: {en: `Room ${id}`, ru: `Комната ${id}`}, description: {en: "An old stone chamber.", ru: "Старинная каменная комната."}, surface: "ground"}));
  const map = [
    {roomId: 0, x: 0, y: 0, z: 0, exits: [{direction: "north", destinationId: 1}]},
    {roomId: 1, x: 0, y: 1, z: 0, exits: [{direction: "south", destinationId: 0}, {direction: "north", destinationId: 2}]},
    {roomId: 2, x: 0, y: 2, z: 0, exits: [{direction: "south", destinationId: 1}, {direction: "north", destinationId: 3, doorId: "gate", oneway: false}]},
    {roomId: 3, x: 0, y: 3, z: 0, exits: [{direction: "south", destinationId: 2, doorId: "gate", oneway: false}, {direction: "down", destinationId: 0, oneway: true}]}
  ];
  for (const [file, data] of Object.entries({"area.json": area, "rooms.json": rooms, "map.json": map})) fs.writeFileSync(path.join(folder, file), JSON.stringify(data));
  return {directory, folder, area, rooms, map};
}

test("JSON loader reconstructs NPCs, inventory, shared doors and directed topology", (t) => {
  const {directory} = fixture(t);
  setupWorld({areasDirectory: directory});
  const area = game.world.areas.get("test");
  assert.equal(area.npcs.size, 3);
  assert.equal(area.items.size, 3);
  assert.equal(area.items.get("key").location, area.npcs.get("guard").inventory);
  assert.equal(area.items.get("sword").location, area.rooms.get(1));
  assert.equal(area.npcs.get("guard").owner.sword, area.items.get("sword"));
  assert.equal(area.npcs.get("guard").owner.key, area.items.get("key"));
  const gate = area.doors.get("gate");
  assert.equal(area.rooms.get(2).exits.find((exit) => exit.direction === "north").door, gate);
  assert.equal(area.rooms.get(3).exits.find((exit) => exit.direction === "south").door, gate);
  assert.equal(gate.keyId, area.items.get("key").id);
  assert.equal(gate.locked, true);
  assert.equal(area.rooms.get(3).down, area.rooms.get(0));
  assert.equal(area.rooms.get(0).up, null);
  assert.equal(area.rooms.get(3).exits.find((exit) => exit.direction === "down").oneway, true);
});

test("save/restart preserves world edits and resets all session entity state", async (t) => {
  const {directory, folder, area: definitions} = fixture(t);
  const {makeUser} = setupWorld({areasDirectory: directory});
  let area = game.world.areas.get("test");
  const user = makeUser();
  area.rooms.get(0).name.en = "Restored Hall";
  area.rooms.get(0).description.en = "A carefully repaired hall.";
  area.doors.get("gate").closed = false;
  area.doors.get("gate").locked = false;
  area.npcs.get("guard").owner.memory.questIsDone = true;
  area.items.get("sword").move(area.npcs.get("guard").inventory);
  area.items.get("key").move(user.character.inventory);
  area.items.get("boat").move(area.rooms.get(0));
  await interpret(user, "mole");
  await interpret(user, "down");
  const cellarId = user.character.location.id;
  user.character.location.name.en = "New cellar";
  await saveWorld();
  const savedDefinitions = JSON.parse(fs.readFileSync(path.join(folder, "area.json")));
  assert.deepEqual(savedDefinitions.npcs, definitions.npcs);
  assert.deepEqual(savedDefinitions.items, definitions.items);
  assert.deepEqual(savedDefinitions.doors, definitions.doors);
  setupWorld({areasDirectory: directory});
  area = game.world.areas.get("test");
  assert.equal(area.rooms.get(0).name.en, "Restored Hall");
  assert.equal(area.rooms.get(0).description.en, "A carefully repaired hall.");
  assert.equal(area.rooms.get(cellarId).name.en, "New cellar");
  assert.equal(area.rooms.get(0).down, area.rooms.get(cellarId));
  assert.equal(area.rooms.get(cellarId).up, area.rooms.get(0));
  assert.equal(area.largestRoomId, cellarId);
  assert.equal(area.items.get("sword").location, area.rooms.get(1));
  assert.equal(area.items.get("key").location, area.npcs.get("guard").inventory);
  assert.equal(area.items.get("boat").location, area.rooms.get(3));
  assert.equal(area.npcs.get("guard").owner.memory.questIsDone, false);
  assert.equal(area.doors.get("gate").closed, true);
  assert.equal(area.doors.get("gate").locked, true);
  assert.equal(area.rooms.get(3).exits.find((exit) => exit.direction === "down").oneway, true);
});

test("missing startup references reject before any area or entity registration", (t) => {
  for (const [label, change, error] of [
    ["NPC room", (data) => { data.area.npcs[0].roomId = 999; }, /missing room/],
    ["item owner", (data) => { data.area.items[1].npcId = "missing"; }, /missing NPC/],
    ["door key", (data) => { data.area.doors[0].keyItemId = "missing"; }, /missing key/],
    ["quest item", (data) => { data.area.npcs[1].quest.swordItemId = "missing"; }, /sword and key/],
    ["exit room", (data) => { data.map[0].exits[0].destinationId = 999; }, /missing room/],
    ["exit door", (data) => { data.map[2].exits[1].doorId = "missing"; }, /missing door/]
  ]) {
    const data = fixture(t);
    change(data);
    fs.writeFileSync(path.join(data.folder, "area.json"), JSON.stringify(data.area));
    fs.writeFileSync(path.join(data.folder, "map.json"), JSON.stringify(data.map));
    assert.throws(() => setupWorld({areasDirectory: data.directory}), error, label);
    for (const collection of Object.values(game.world)) assert.equal(collection.size, 0, label);
  }
});

test("areas without entity definitions remain loadable and central cells serialize", (t) => {
  const {directory, folder, area} = fixture(t);
  delete area.items;
  delete area.npcs;
  delete area.doors;
  fs.writeFileSync(path.join(folder, "area.json"), JSON.stringify(area));
  const map = JSON.parse(fs.readFileSync(path.join(folder, "map.json")));
  for (const cell of map) for (const exit of cell.exits) delete exit.doorId;
  fs.writeFileSync(path.join(folder, "map.json"), JSON.stringify(map));
  const {Area, Room} = setupWorld({areasDirectory: directory});
  assert.equal(game.world.areas.get("test").npcs.size, 0);
  const generated = new Area({id: "generated", name: {en: "Generated"}, largestRoomId: 0});
  const room = new Room({name: {en: "Origin"}, surface: "ground"});
  room.register(generated, 0);
  room.registerAsCentralRoom();
  assert.deepEqual(generated.map[0].serialize(), {x: 0, y: 0, z: 0, roomId: 0, exits: []});
});

test("room descriptions remain optional when loading and rendering old JSON", async (t) => {
  const {directory, folder, rooms} = fixture(t);
  delete rooms[0].description;
  fs.writeFileSync(path.join(folder, "rooms.json"), JSON.stringify(rooms));
  const {makeUser} = setupWorld({areasDirectory: directory});
  const user = makeUser();
  for (const language of ["en", "ru"]) {
    user.language = language;
    const output = await interpret(user, "look");
    assert.match(output, language === "en" ? /Room 0/ : /Комната 0/);
    assert.doesNotMatch(output, /undefined|null|lorem ipsum/i);
  }
  await saveWorld();
  const saved = JSON.parse(fs.readFileSync(path.join(folder, "rooms.json")));
  assert.equal(Object.hasOwn(saved[0], "description"), false);
});
