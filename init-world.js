const Room = require("./src/room");
const Character = require("./src/character");
const Item = require("./src/item");

new Room("The altar").register();
new Room("The trail").register();
new Room("The west garden").register();
new Room("The east garden").register();
new Room("The gate").register();
new Room("The wall").register();

new Character("acolyte").register();
new Character("bird").register();
new Character("guard").register();

new Item("rusty sword", 130).register();
new Item("cherry", 125).register();
