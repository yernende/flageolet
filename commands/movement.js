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
  pattern: "go <exit>",
  priority: 0,
  action: moveCharacterToExit
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
}, {
  pattern: "open <exit>",
  priority: 1,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.closed) {
      this.message("Door Already Opened");
      return false;
    }

    if (exit.door.locked && !this.execute("unlock", exit)) {
      return false;
    }

    exit.door.closed = false;
    this.character.location.broadcast("Door Opened", this.character, exit.door);
    return true;
  }
}, {
  pattern: "close <exit>",
  priority: 1,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (exit.door.closed) {
      this.message("Door Already Closed");
      return false;
    }

    exit.door.closed = true;
    this.character.location.broadcast("Door Closed", this.character, exit.door);
    return true;
  }
}, {
  pattern: "unlock <exit>",
  priority: 1,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.locked) {
      this.message("Door Already Unlocked");
      return false;
    }

    if (this.character.inventory.items.some((item) => item.id == exit.door.keyId)) {
      this.character.location.broadcast("Door Unlocked", this.character, exit.door);
      exit.door.locked = false;
      return true;
    } else {
      this.message("No Key", exit.door);
      return false;
    }
  }
}, {
  pattern: "lock <exit>",
  priority: 1,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.closed && !this.execute("close", exit)) {
      return false;
    }

    if (exit.door.locked) {
      this.message("Door Already Locked");
      return false;
    }

    if (this.character.inventory.items.some((item) => item.id == exit.door.keyId)) {
      this.character.location.broadcast("Door Locked", this.character, exit.door);
      exit.door.locked = true;
      return true;
    } else {
      this.message("No Key", exit.door);
      return false;
    }
  }
}];

function moveCharacterToDirection(direction) {
  let exit = this.character.location.exits.find((exit) => exit.direction == direction);

  if (!exit) {
    this.message("Unkown Direction");
  } else {
    moveCharacterToExit.call(this, exit)
  }
}

function moveCharacterToExit(exit) {
  let destination = exit.destination;

  if (exit.door && exit.door.closed) {
    if (!this.execute("open", exit)) {
      return;
    }
  }

  if (destination.surface == "water" && !this.character.inventory.items.some((item) => item.type == "boat")) {
    this.message("Can't Swim");
    return;
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
