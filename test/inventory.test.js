const test = require("node:test");
const assert = require("node:assert/strict");
const { setupWorld } = require("./helpers");

function output(user) {
  return user.output.join("").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/\r/g, "");
}

function fixture(language = "en") {
  const world = setupWorld();
  const area = new world.Area({id: "inventory-tests", name: {en: "Test area", ru: "Тест"}, largestRoomId: 1});
  area.register();
  const land = new world.Room({name: {en: "Land", ru: "Суша"}, surface: "grass"});
  land.register(area, 0);
  land.registerAsCentralRoom();
  const water = new world.Room({name: {en: "Water", ru: "Вода"}, surface: "water"});
  water.register(area, 1);

  const users = [
    {en: "alice", ru: "алиса"},
    {en: "bob", ru: "боб"},
    {en: "chris", ru: "крис"}
  ].map((name) => {
    const user = world.makeUser(language);
    user.character.name = name;
    user.character.keywords = Object.values(name);
    user.character.move(land);
    return user;
  });

  const clear = () => users.forEach((user) => { user.output = []; });
  clear();
  return {...world, area, land, water, users, clear};
}

for (const language of ["en", "ru"]) {
  test(`take, drop and give retain ownership and identify actors in ${language}`, async () => {
    const {Item, land, users: [alice, bob, chris], clear} = fixture(language);
    const apple = new Item({name: {en: "apple", ru: "яблоко"}});
    apple.move(land);

    await alice.interpret("take apple");
    assert.equal(apple.location, alice.character.inventory);
    assert.equal(land.items.includes(apple), false);
    assert.equal(output(alice), language == "en" ? "You take apple.\n" : "Ты подбираешь яблоко.\n");
    assert.equal(output(bob), language == "en" ? "Alice takes apple.\n" : "Алиса подбирает яблоко.\n");

    clear();
    await alice.interpret("inventory");
    assert.match(output(alice), language == "en" ? /apple/ : /яблоко/);

    clear();
    await alice.interpret("drop apple");
    assert.equal(apple.location, land);
    assert.equal(alice.character.inventory.items.includes(apple), false);
    assert.equal(output(bob), language == "en" ? "Alice drops apple.\n" : "Алиса бросает яблоко.\n");

    await alice.interpret("get apple");
    clear();
    await alice.interpret("give apple to bob");
    assert.equal(apple.location, bob.character.inventory);
    assert.deepEqual(alice.character.inventory.items, []);
    assert.deepEqual(bob.character.inventory.items, [apple]);
    assert.equal(output(alice), language == "en" ? "You give apple to bob.\n" : "Ты отдаёшь яблоко боб.\n");
    assert.equal(output(bob), language == "en" ? "Alice gives apple to you.\n" : "Алиса даёт тебе яблоко.\n");
    assert.equal(output(chris), language == "en" ? "Alice gives apple to bob.\n" : "Алиса отдаёт яблоко боб.\n");
  });

  test(`full inventories refuse transfers without losing items in ${language}`, async () => {
    const {Item, land, users: [alice, bob], clear} = fixture(language);
    const apple = new Item({name: {en: "apple", ru: "яблоко"}});
    apple.move(land);
    alice.character.inventory.capacity = 0;
    await alice.interpret("take apple");
    assert.equal(apple.location, land);
    assert.deepEqual(land.items, [apple]);
    assert.deepEqual(alice.character.inventory.items, []);

    alice.character.inventory.capacity = 1;
    await alice.interpret("take apple");
    bob.character.inventory.capacity = 0;
    clear();
    assert.equal(alice.execute("give", apple, bob.character), false);
    assert.equal(apple.location, alice.character.inventory);
    assert.deepEqual(alice.character.inventory.items, [apple]);
    assert.deepEqual(bob.character.inventory.items, []);
    assert.equal(output(alice), language == "en" ? "Bob's hands are full.\n" : "Руки боб полны.\n");
    assert.equal(output(bob), "");
  });
}

test("programmatic give rejects invalid transfers and returns success for an NPC reward", () => {
  const {Item, Character, land, water, users: [alice, bob]} = fixture();
  const apple = new Item({name: {en: "apple", ru: "яблоко"}});
  apple.move(alice.character.inventory);
  const key = new Item({name: {en: "key", ru: "ключ"}});
  const npc = new Character({name: {en: "keeper", ru: "хранитель"}});
  npc.move(land);
  key.move(npc.inventory);

  assert.equal(alice.execute("give", undefined, bob.character), false);
  assert.equal(alice.execute("give", key, bob.character), false);
  assert.equal(alice.execute("give", apple, undefined), false);
  assert.equal(alice.execute("give", apple, {}), false);
  bob.character.move(water);
  assert.equal(alice.execute("give", apple, bob.character), false);
  assert.equal(apple.location, alice.character.inventory);
  assert.deepEqual(alice.character.inventory.items, [apple]);
  assert.equal(key.location, npc.inventory);
  assert.deepEqual(bob.character.inventory.items, []);

  alice.character.inventory.capacity = 1;
  assert.equal(npc.owner.execute("give", key, alice.character), false);
  assert.equal(key.location, npc.inventory);
  alice.character.inventory.capacity = 2;
  assert.equal(npc.owner.execute("give", key, alice.character), true);
  assert.equal(key.location, alice.character.inventory);
  assert.deepEqual(npc.inventory.items, []);
  assert.equal(npc.owner.execute("give", key, alice.character), false);
  assert.deepEqual(alice.character.inventory.items, [apple, key]);
});

test("paired doors share state and water requires a carried boat", async () => {
  const {Item, Room, land, water, users: [alice], clear} = fixture();
  const key = new Item({name: {en: "key", ru: "ключ"}});
  const gates = new Room.Door({name: {en: "gates", ru: "врата"}, closed: true, locked: true, keyId: key.id});
  land.link("north", water, gates);
  const boat = new Item({name: {en: "boat", ru: "лодка"}, type: "boat"});
  assert.equal(water.exits[0].door, land.exits[0].door);

  await alice.interpret("north");
  assert.equal(alice.character.location, land);
  assert.equal(gates.locked, true);
  assert.match(output(alice), /You do not have the key/);

  clear();
  key.move(alice.character.inventory);
  await alice.interpret("north");
  assert.equal(alice.character.location, land);
  assert.equal(gates.locked, false);
  assert.equal(gates.closed, false);
  assert.match(output(alice), /You cannot swim/);

  boat.move(alice.character.inventory);
  await alice.interpret("north");
  assert.equal(alice.character.location, water);
  await alice.interpret("lock south");
  assert.equal(gates.closed, true);
  assert.equal(gates.locked, true);
  await alice.interpret("unlock south");
  assert.equal(gates.locked, false);
  assert.equal(gates.closed, true);
  await alice.interpret("open south");
  assert.equal(gates.closed, false);
  await alice.interpret("close south");
  assert.equal(gates.closed, true);

  await alice.interpret("drop boat");
  await alice.interpret("south");
  assert.equal(alice.character.location, land);
  await alice.interpret("north");
  assert.equal(alice.character.location, land);
  assert.equal(boat.location, water);
});

test("terminal fallbacks are localized instead of rendering objects", () => {
  const {users: [alice]} = fixture();
  for (const language of ["en", "ru"]) {
    alice.language = language;
    alice.output = [];
    for (const method of ["writeRoom", "writeCharacter", "writeItem", "writeDoor"]) {
      alice.xterm[method](undefined);
      alice.xterm.endln();
    }
    assert.equal(output(alice), language == "en" ? "Somewhere\nSomeone\nSomething\nSomething\n" : "Где-то\nКто-то\nЧто-то\nЧто-то\n");
  }
});

test("speech and localized template values preserve literal dollar text", async () => {
  const {users: [alice, bob], clear} = fixture();
  const speech = "Hello, $message! A $coin costs $5; $foreground(40, $actor).";
  for (const language of ["en", "ru"]) {
    alice.language = language;
    bob.language = language;
    clear();
    await alice.interpret(`say ${speech}`);
    assert.equal(output(alice), language == "en" ? `You say: "${speech}"\n` : `Ты произносишь: "${speech}"\n`);
    assert.equal(output(bob), language == "en" ? `Alice says: "${speech}".\n` : `Алиса произносит: "${speech}"\n`);

    clear();
    alice.xterm.writeln("Text: $value.", {value: {
      en: "$value costs $5",
      ru: "$value стоит $5"
    }});
    assert.equal(output(alice), language == "en" ? "Text: $value costs $5.\n" : "Text: $value стоит $5.\n");
  }
});
