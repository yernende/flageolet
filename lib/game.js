const Room = require("./room");

const world = [
  new Room("The altar"),
  new Room("The trail"),
  new Room("The west garden"),
  new Room("The east garden"),
  new Room("The gate"),
  new Room("The wall")
];

Room.link(world, "The altar", "north", "The trail");
Room.link(world, "The trail", "west", "The west garden");
Room.link(world, "The trail", "east", "The east garden");
Room.link(world, "The trail", "north", "The gate");
Room.link(world, "The trail", "down", "The wall");

module.exports = {
  commands: [],
  users: [],
  world: world
};
