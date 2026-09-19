const test = require("node:test");
const assert = require("node:assert/strict");
const {setupWorld, interpret} = require("./helpers");

async function walk(user, directions) {
  for (const direction of directions) await interpret(user, direction);
}

function temple(world) {
  return world.game.world.areas.get("flageolet");
}

test("the restored world has 35 connected rooms with consistent map coordinates", () => {
  const area = temple(setupWorld());
  assert.deepEqual([...area.rooms.keys()], Array.from({length: 37}, (_, id) => id).filter((id) => id != 21 && id != 22));
  assert.equal(area.map.length, 35);
  assert.equal(new Set(area.map.map(({x, y, z}) => `${x},${y},${z}`)).size, 35);

  const coordinates = new Map(area.map.map((cell) => [cell.room, cell]));
  const delta = {north: [0, 1, 0], south: [0, -1, 0], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 0, 1], down: [0, 0, -1]};
  const seen = new Set([area.rooms.get(0)]);
  for (const room of seen) {
    for (const exit of room.exits) {
      seen.add(exit.destination);
      const source = coordinates.get(room);
      const destination = coordinates.get(exit.destination);
      assert.deepEqual([destination.x - source.x, destination.y - source.y, destination.z - source.z], delta[exit.direction]);
    }
    for (const language of ["en", "ru"]) {
      const lines = room.description[language].split("\n");
      assert.equal(lines.length, 3);
      assert.ok(lines.every((line) => line.length <= 54));
    }
  }
  assert.equal(seen.size, 35);
  assert.equal([...area.rooms.values()].flatMap((room) => room.exits).filter((exit) => exit.oneway).length, 4);
  assert.equal(area.rooms.get(36).exits.length, 0);
});

for (const language of ["en", "ru"]) {
  test(`two players share the guard quest and gate passage (${language})`, async () => {
    const world = setupWorld();
    const area = temple(world);
    const first = world.makeUser(language);
    const second = world.makeUser(language);
    const guard = area.npcs.get("guard");
    const sword = area.items.get("sword");
    const key = area.items.get("key");
    const gate = area.doors.get("temple-gates");

    for (const user of [first, second]) {
      await walk(user, ["north", "north"]);
      await interpret(user, "north");
      assert.equal(user.character.location.id, 4, "the gate starts locked");
      await interpret(user, "talk guard");
      await interpret(user, "2");
    }
    assert.ok(guard.owner.memory.questReceivers.has(first.character));
    assert.ok(guard.owner.memory.questReceivers.has(second.character));

    await walk(first, ["south", "west", "get sword", "east", "north"]);
    const rewardText = await interpret(first, "give sword guard");
    assert.equal(sword.location, guard.inventory);
    assert.equal(key.location, first.character.inventory);
    assert.equal(guard.owner.memory.questIsDone, true);
    assert.match(rewardText, language === "en" ? /This key unlocks the northern gates/ : /Этот ключ отпирает северные ворота/);

    await interpret(second, "talk guard");
    assert.equal(second.dialog, null, "a second quest is not offered after completion");
    await interpret(first, "north");
    await interpret(second, "north");
    assert.equal(first.character.location.id, 6);
    assert.equal(second.character.location.id, 6);
    assert.equal(gate.closed, false);
    assert.equal(gate.locked, false);
    assert.equal(area.rooms.get(4).exits.find((exit) => exit.direction === "north").door,
      area.rooms.get(6).exits.find((exit) => exit.direction === "south").door);
    assert.equal(area.items.size, 4, "the shared reward creates no additional item");
  });
}

test("the guard accepts only the configured sword, regardless of its translated name", async () => {
  const world = setupWorld();
  const area = temple(world);
  const user = world.makeUser();
  const guard = area.npcs.get("guard");
  const sword = area.items.get("sword");
  const key = area.items.get("key");
  const imitation = new world.Item({name: {en: "imitation sword", ru: "поддельный меч"}, color: 130});
  imitation.register();
  imitation.move(user.character.inventory);
  await walk(user, ["north", "north"]);
  await interpret(user, "give imitation guard");
  assert.equal(guard.owner.memory.questIsDone, false);
  assert.equal(key.location, guard.inventory);
  assert.equal(sword.location, area.rooms.get(2));

  sword.name = {en: "old blade", ru: "старый клинок"};
  sword.move(user.character.inventory);
  await interpret(user, "give sword guard");
  assert.equal(key.location, user.character.inventory);
  assert.equal(guard.owner.memory.questIsDone, true);

  // A future script may hand the same sword out again; it must not issue a second reward.
  sword.move(user.character.inventory);
  await interpret(user, "give sword guard");
  assert.equal(key.location, user.character.inventory);
  assert.equal(sword.location, guard.inventory);
  assert.equal(user.character.inventory.items.filter((item) => item === key).length, 1);
});

test("a missing key leaves the shared reward pending and another player can recover it", async () => {
  const world = setupWorld();
  const area = temple(world);
  const first = world.makeUser();
  const second = world.makeUser();
  const guard = area.npcs.get("guard");
  const key = area.items.get("key");
  key.move(area.rooms.get(3));

  await walk(first, ["north", "west", "get sword", "east", "north"]);
  assert.match(await interpret(first, "give sword guard"), /cannot find the gate key/);
  assert.equal(guard.owner.memory.questIsDone, false);
  await interpret(first, "talk guard");
  await interpret(first, "1");
  assert.equal(guard.owner.memory.questIsDone, false);

  await walk(second, ["north", "east", "get key", "west", "north", "give key guard"]);
  await interpret(second, "talk guard");
  await interpret(second, "1");
  assert.equal(key.location, second.character.inventory);
  assert.equal(guard.owner.memory.questIsDone, true);
});

test("a full inventory does not consume the reward and dialogue allows a retry", async () => {
  const world = setupWorld();
  const area = temple(world);
  const user = world.makeUser();
  const guard = area.npcs.get("guard");
  const key = area.items.get("key");
  area.items.get("sword").move(guard.inventory);
  area.items.get("cherry").move(user.character.inventory);
  user.character.inventory.capacity = 1;
  await walk(user, ["north", "north", "talk guard"]);
  assert.match(await interpret(user, "1"), /Your hands are full/);
  assert.equal(key.location, guard.inventory);
  assert.equal(guard.owner.memory.questIsDone, false);

  await walk(user, ["drop cherry", "talk guard", "1"]);
  assert.equal(key.location, user.character.inventory);
  assert.equal(guard.owner.memory.questIsDone, true);
});

test("a dialogue opened before someone else finishes cannot start another quest", async () => {
  const world = setupWorld();
  const area = temple(world);
  const first = world.makeUser();
  const second = world.makeUser();
  await walk(second, ["north", "north", "talk guard"]);
  assert.ok(second.dialog);
  await walk(first, ["north", "west", "get sword", "east", "north", "give sword guard"]);
  assert.match(await interpret(second, "2"), /the gate key has been handed over/);
  assert.equal(second.dialog, null);
  assert.equal(area.items.get("key").location, first.character.inventory);
  assert.equal(area.npcs.get("guard").owner.memory.questReceivers.has(second.character), false);
});

test("the old land route reaches the boat, which permits river and well movement", async () => {
  const world = setupWorld();
  const area = temple(world);
  const user = world.makeUser();
  area.items.get("key").move(user.character.inventory);
  await walk(user, ["north", "north", "north", "north", "west", "north", "north", "east", "east", "east", "south", "south", "east", "east", "north", "north", "east"]);
  assert.equal(user.character.location.id, 20);
  await walk(user, ["get boat", "west", "west"]);
  assert.equal(user.character.location.id, 31);
  await walk(user, ["drop boat", "north"]);
  assert.equal(user.character.location.id, 31, "water blocks movement without a boat");
  await walk(user, ["get boat", "north"]);
  assert.equal(user.character.location.id, 30);
  await walk(user, ["recall", "north", "down"]);
  assert.equal(user.character.location.id, 5);
  await interpret(user, "up");
  assert.equal(user.character.location.id, 1);
});

test("the bird moves on arrival and safely stays in a room without exits", async (context) => {
  const world = setupWorld();
  const area = temple(world);
  const user = world.makeUser();
  const bird = area.npcs.get("bird");
  context.mock.method(Math, "random", () => 0);
  await walk(user, ["north", "east"]);
  assert.equal(bird.location.id, 1);

  bird.move(area.rooms.get(36));
  area.items.get("boat").move(user.character.inventory);
  user.character.move(area.rooms.get(34));
  await interpret(user, "south");
  assert.equal(user.character.location.id, 36);
  assert.equal(bird.location.id, 36);
  await interpret(user, "north");
  assert.equal(user.character.location.id, 36, "the waterfall has no reverse exit");
  await interpret(user, "recall");
  assert.equal(user.character.location.id, 0);
});

test("talk prefers the guide or guard over a nearby bird and preserves explicit selection", async () => {
  const world = setupWorld();
  const area = temple(world);
  const user = world.makeUser();
  const bird = area.npcs.get("bird");

  bird.move(area.rooms.get(0));
  assert.match(await interpret(user, "talk"), /What would you like to know/);
  await interpret(user, "3");
  assert.match(await interpret(user, "talk bird"), /don't want to talk/);
  assert.equal(user.dialog, null);

  bird.move(area.rooms.get(4));
  user.character.move(area.rooms.get(4));
  assert.match(await interpret(user, "talk"), /I want to leave the temple/);
  await interpret(user, "3");

  bird.move(area.rooms.get(20));
  user.character.move(area.rooms.get(20));
  assert.match(await interpret(user, "talk"), /don't want to talk/);
  assert.equal(user.dialog, null);
});
