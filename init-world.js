const Room = require("./src/room");
const Character = require("./src/character");
const Item = require("./src/item");

const AcolyteAI = require("./ai/acolyte");
const BirdAI = require("./ai/bird");

let altar = new Room({
  name: {en: "The altar", ru: "Алтарь"},
  surface: "marble"
});

let trail = new Room({
  name: {en: "The trail", ru: "Тропинка"},
  surface: "ground"
});

let westGarden = new Room({
  name: {en: "The west garden", ru: "Западный сад"},
  surface: "grass"
});

let eastGarden = new Room({
  name: {en: "The east garden", ru: "Восточный сад"},
  surface: "grass"
});

let gate = new Room({
  name: {en: "The gate", ru: "Врата"},
  surface: "ground"
});

let wall = new Room({
  name: {en: "The wall", ru: "Колодец"},
  surface: "water"
});

let acolyte = new Character({
  name: {en: "acolyte", ru: "аколит"},
  color: 98,
  owner: new AcolyteAI()
});

let bird = new Character({
  name: {en: "bird", ru: "птичка"},
  color: 94,
  owner: new BirdAI()
});

let guard = new Character({
  name: {en: "guard", ru: "стражник"},
  color: 31
});

let sword = new Item({
  name: {en: "rusty sword", ru: "ржавый меч"},
  color: 130
});

let cherry = new Item({
  name: {en: "cherry", ru: "вишня"},
  color: 125
});

for (let entity of [altar, trail, westGarden, eastGarden, gate, wall, acolyte, bird, guard, sword, cherry]) {
  entity.register();
}

altar.link("north", trail);
trail.link("west", westGarden);
trail.link("east", eastGarden);
trail.link("north", gate);
trail.link("down", wall);

acolyte.move(altar);
guard.move(gate);
bird.move(eastGarden);
sword.move(westGarden);
cherry.move(eastGarden);
