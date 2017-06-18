const game = require("../src/game");

module.exports = [{
  pattern: "north",
  priority: 0,
  action: moveCharacterToDirection
}, {
  pattern: "east",
  priority: 0,
  action: moveCharacterToDirection
}, {
  pattern: "south",
  priority: 0,
  action: moveCharacterToDirection
}, {
  pattern: "west",
  priority: 0,
  action: moveCharacterToDirection
}, {
  pattern: "up",
  priority: 0,
  action: moveCharacterToDirection
}, {
  pattern: "down",
  priority: 0,
  action: moveCharacterToDirection
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
}, {
  pattern: "recall",
  priority: 0,
  action() {
    this.character.move(game.world.rooms.get(0));
  }
}];

function moveCharacterToDirection(direction) {
  let destination = this.character.location.exits[direction];

  if (!destination) {
    this.message("Unkown Direction");
    return;
  }

  if (destination.surface == "water" && !this.character.inventory.items.some((item) => item.type == "boat")) {
    this.message("Can't Swim");
    return;
  }

  // If all is OK
  this.character.location.broadcast({
    filter: (target) => target != this.character,
    message: ["Character Left", this.character, direction]
  });

  this.character.move(destination);

  this.character.location.broadcast({
    filter: (target) => target != this.character,
    message: ["Character Arrived", this.character]
  });
}
