const Room = require("./room");
const Item = require("./item");

const rooms = [
  new Room("The altar"),
  new Room("The trail"),
  new Room("The west garden"),
  new Room("The east garden"),
  new Room("The gate"),
  new Room("The wall")
];

Room.link(rooms, "The altar", "north", "The trail");
Room.link(rooms, "The trail", "west", "The west garden");
Room.link(rooms, "The trail", "east", "The east garden");
Room.link(rooms, "The trail", "north", "The gate");
Room.link(rooms, "The trail", "down", "The wall");

const items = [
  new Item("rusty sword", 130),
  new Item("cherry", 125)
];

Item.place(items, rooms, "rusty sword", "The west garden");
Item.place(items, rooms, "cherry", "The east garden");

module.exports = {
  commands: [],
  messages: [],
  users: [],
  world: {
    rooms: rooms
  }
};
