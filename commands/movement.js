const game = require("../src/game");

module.exports = [{
  pattern: "north",
  priority: 0,
  action() {
    this.character.moveDirection("north");
  }
}, {
  pattern: "east",
  priority: 0,
  action() {
    this.character.moveDirection("east");
  }
}, {
  pattern: "south",
  priority: 0,
  action() {
    this.character.moveDirection("south");
  }
}, {
  pattern: "west",
  priority: 0,
  action() {
    this.character.moveDirection("west");
  }
}, {
  pattern: "up",
  priority: 0,
  action() {
    this.character.moveDirection("up");
  }
}, {
  pattern: "down",
  priority: 0,
  action() {
    this.character.moveDirection("down");
  }
}, {
  pattern: "look",
  priority: 0,
  action() {
    this.message("Room Description", this.character.location);
  }
}, {
  pattern: "rooms",
  priority: 0,
  action() {
    this.message("Room List", game.world.rooms)
  }
}, {
  pattern: "goto <number>",
  priority: 0,
  action(id) {
    if (game.world.rooms.has(id)) {
      this.character.move(game.world.rooms.get(id));
    } else {
      this.message("Unknown Room Id");
    }
  }
}];
