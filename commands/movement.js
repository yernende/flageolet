const game = require("../src/game");

module.exports = [
  { pattern: "north", priority: 0, action: moveCharacterToDirection },
  { pattern: "east", priority: 0, action: moveCharacterToDirection },
  { pattern: "south", priority: 0, action: moveCharacterToDirection },
  { pattern: "west", priority: 0, action: moveCharacterToDirection },
  { pattern: "up", priority: 0, action: moveCharacterToDirection },
  { pattern: "down", priority: 0, action: moveCharacterToDirection },
  {
    pattern: "recall",
    priority: 0,
    action() {
      this.character.move(game.world.rooms.get(0));
    }
  }
];

module.exports.push({
  pattern: "look",
  priority: 1,
  action() {
    this.message("Room Description", this.character.location);
  }
}, {
  pattern: "rooms",
  priority: 1,
  action() {
    this.message("Room List", game.world.rooms)
  }
}, {
  pattern: "go <exit>",
  priority: 5,
  action: moveCharacterToExit
}, {
  pattern: "goto <number>",
  priority: 6,
  action(id) {
    if (!game.world.rooms.has(id)) {
      return this.message("Unknown Room Id");
    }

    this.character.move(game.world.rooms.get(id));
  }
});

function moveCharacterToDirection(direction) {
  let exit = this.character.location.exits.find((exit) => exit.direction == direction);

  if (!exit) {
    return this.message("Unkown Direction");
  }

  moveCharacterToExit.call(this, exit)
}

function moveCharacterToExit(exit) {
  let destination = exit.destination;

  if (exit.door && exit.door.closed) {
    if (!this.execute("open", exit)) {
      return;
    }
  }

  if (destination.surface == "water" && !this.character.inventory.items.some((item) => item.type == "boat")) {
    return this.message("Can't Swim");
  }

  // If all is OK
  this.character.location.broadcast({
    filter: (target) => target != this.character,
    message: ["Character Left", this.character, exit.direction]
  });

  this.character.move(destination);

  this.character.location.broadcast({
    filter: (target) => target != this.character,
    message: ["Character Arrived", this.character]
  });
}
