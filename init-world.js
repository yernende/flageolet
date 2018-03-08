const Area = require("./src/area");
const Room = require("./src/room");
const Character = require("./src/character");
const Item = require("./src/item");

const AcolyteAI = require("./ai/acolyte");
const BirdAI = require("./ai/bird");
const GuardAI = require("./ai/guard");

let area = new Area({
  id: "flageolet",
  name: {en: "Flageolet", ru: "Флажолет"}
});

let rooms = {
  altar: new Room({
    name: {en: "Altar", ru: "Алтарь"},
    surface: "marble"
  }),
  trail: new Room({
    name: {en: "Trail", ru: "Тропинка"},
    surface: "ground"
  }),
  westGarden: new Room({
    name: {en: "West garden", ru: "Западный сад"},
    surface: "grass"
  }),
  eastGarden: new Room({
    name: {en: "East garden", ru: "Восточный сад"},
    surface: "grass"
  }),
  gate: new Room({
    name: {en: "Gate", ru: "Врата"},
    surface: "ground"
  }),
  wall: new Room({
    name: {en: "Wall", ru: "Колодец"},
    surface: "water"
  }),
  woodlandEdge1: new Room({
    name: {en: "Woodland edge", ru: "Опушка"},
    surface: "ground"
  }),
  forestTrail1: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  forestTrail2: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  forestTrail3: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  forestTrail4: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  forestTrail5: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  forestTrail6: new Room({
    name: {en: "Forest trail", ru: "Тропинка в лесу"},
    surface: "ground"
  }),
  steepBank1: new Room({
    name: {en: "Steep riverbank", ru: "Яр"},
    surface: "ground"
  }),
  steepBank2: new Room({
    name: {en: "Steep riverbank", ru: "Яр"},
    surface: "ground"
  }),
  nearBridgeWest: new Room({
    name: {en: "Near a bridge", ru: "У моста"},
    surface: "ground"
  }),
  bridge: new Room({
    name: {en: "Bridge", ru: "Мост"},
    surface: "wood"
  }),
  nearBridgeEast: new Room({
    name: {en: "Near a bridge", ru: "У моста"},
    surface: "ground"
  }),
  bank1: new Room({
    name: {en: "Riverbank", ru: "Берег реки"},
    surface: "ground"
  }),
  bank2: new Room({
    name: {en: "Riverbank", ru: "Берег реки"},
    surface: "ground"
  }),
  woodlandEdge2: new Room({
    name: {en: "Woodland edge", ru: "Опушка"},
    surface: "ground"
  }),
  bushes: new Room({
    name: {en: "Bushes", ru: "В кустах"},
    surface: "grass"
  }),
  hut: new Room({
    name: {en: "Hut", ru: "Хижина"},
    surface: "wood"
  }),
  ravine1: new Room({
    name: {en: "Ravine", ru: "Овраг"},
    surface: "grass"
  }),
  ravine2: new Room({
    name: {en: "Ravine", ru: "Овраг"},
    surface: "grass"
  }),
  gentleDescent: new Room({
    name: {en: "Gentle descent", ru: "Пологий спуск"},
    surface: "grass"
  }),
  river1: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river2: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river3: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river4: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river5: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river6: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river7: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river8: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  river9: new Room({
    name: {en: "River", ru: "Река"},
    surface: "water"
  }),
  riverSource: new Room({
    name: {en: "River source", ru: "Исток реки"},
    surface: "water"
  }),
  waterfall: new Room({
    name: {en: "Waterfall", ru: "Водопад"},
    surface: "water"
  })
}

let characters = {
  acolyte: new Character({
    name: {en: "acolyte", ru: "аколит"},
    color: 98,
    flags: [{en: "trader", ru: "торговец"}],
    owner: new AcolyteAI()
  }),
  bird: new Character({
    name: {en: "bird", ru: "птичка"},
    color: 94,
    owner: new BirdAI()
  }),
  guard: new Character({
    name: {en: "guard", ru: "стражник"},
    flags: [{en: "questor", ru: "квестор"}],
    color: 31,
    owner: new GuardAI()
  })
}

let items = {
  sword: new Item({
    name: {en: "rusty sword", ru: "ржавый меч"},
    color: 130
  }),
  cherry: new Item({
    name: {en: "cherry", ru: "вишня"},
    color: 125
  }),
  key: new Item({
    name: {en: "big steel key", ru: "большой стальной ключ"},
    color: 147
  }),
  boat: new Item({
    name: {en: "resine boat", ru: "резиновая лодка"},
    type: "boat"
  })
}

for (let room of Object.values(rooms)) {
  room.area = area;
}

for (let entity of [...Object.values(rooms), ...Object.values(characters), ...Object.values(items)]) {
  entity.register();
}

rooms.altar.registerAsCentralRoom();

// Temple
rooms.altar.link("north", rooms.trail);
rooms.trail.link("west", rooms.westGarden);
rooms.trail.link("east", rooms.eastGarden);
rooms.trail.link("north", rooms.gate);
rooms.trail.link("down", rooms.wall);

// Forest
rooms.gate
  .link("north", rooms.woodlandEdge1, new Room.Door({name: {en: "gates", ru: "врата"}, closed: true, locked: true, keyId: items.key.id}))
  .link("north", rooms.forestTrail1)
  .link("west", rooms.forestTrail2)
  .link("north", rooms.forestTrail3)
  .link("north", rooms.forestTrail4)
  .link("east", rooms.forestTrail5)
  .link("east", rooms.forestTrail6)
  .link("east", rooms.steepBank1)
  .link("south", rooms.steepBank2)
  .link("south", rooms.nearBridgeWest)
  .link("east", rooms.bridge)
  .link("east", rooms.nearBridgeEast)
  .link("north", rooms.bank1)
  .link("north", rooms.bank2)
  .link("east", rooms.woodlandEdge2);

  // Ravine
rooms.forestTrail1.oneway("north", rooms.ravine1);
rooms.forestTrail3.oneway("east", rooms.ravine1);
rooms.forestTrail5.oneway("south", rooms.ravine1);
rooms.ravine1.link("east", rooms.ravine2).link("south", rooms.gentleDescent).link("west", rooms.forestTrail1);

// River
rooms.riverSource
  .link("east", rooms.river1)
  .link("east", rooms.river2)
  .link("east", rooms.river3)
  .link("east", rooms.river4)
  .link("south", rooms.river5)
  .link("south", rooms.river6)
  .link("south", rooms.river7)
  .link("south", rooms.bridge)
  .link("south", rooms.river8)
  .link("south", rooms.river9)
  .oneway("south", rooms.waterfall);

rooms.steepBank1.link("east", rooms.river6).link("east", rooms.bank2);
rooms.steepBank2.link("east", rooms.river7).link("east", rooms.bank1);

// Characters
characters.acolyte.move(rooms.altar);
characters.guard.move(rooms.gate);
characters.bird.move(rooms.eastGarden);

items.sword.move(rooms.westGarden);
items.cherry.move(rooms.eastGarden);
items.key.move(characters.guard.inventory);
items.boat.move(rooms.woodlandEdge2);
