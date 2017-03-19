const Room = require("./src/room");
const Character = require("./src/character");
const Item = require("./src/item");

const AcolyteAI = require("./ai/acolyte");

let altar = new Room("The altar");
let trail = new Room("The trail");
let westGarden = new Room("The west garden");
let eastGarden = new Room("The east garden")
let gate = new Room("The gate");
let wall = new Room("The wall");

let acolyte = new Character("acolyte", 98, new AcolyteAI());
let bird = new Character("bird", 94);
let guard = new Character("guard", 31);

let sword = new Item("rusty sword", 130);
let cherry = new Item("cherry", 125);

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
