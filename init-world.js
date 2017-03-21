const Room = require("./src/room");
const Character = require("./src/character");
const Item = require("./src/item");

const AcolyteAI = require("./ai/acolyte");

let altar = new Room({
  name: "The altar",
  surface: "marble"
});

let trail = new Room({
  name: "The trail",
  surface: "ground"
});

let westGarden = new Room({
  name: "The west garden",
  surface: "grass"
});

let eastGarden = new Room({
  name: "The east garden",
  surface: "grass"
});

let gate = new Room({
  name: "The gate",
  surface: "ground"
});

let wall = new Room({
  name: "The wall",
  surface: "water"
});

let acolyte = new Character({
  name: "acolyte",
  color: 98,
  owner: new AcolyteAI()
});

let bird = new Character({
  name: "bird",
  color: 94
});

let guard = new Character({
  name: "guard",
  color: 31
});

let sword = new Item({
  name: "rusty sword",
  color: 130
});

let cherry = new Item({
  name: "cherry",
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
