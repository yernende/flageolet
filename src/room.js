const game = require("./game");

class Exit {
  constructor({direction, destination, door}) {
    this.direction = direction;
    this.destination = destination;
    this.door = door;
  }
}

class Door {
  constructor({name = {en: "a door", ru: "дверь"}, closed = true, locked = false, keyId = null}) {
    this.name = name;
    this.closed = closed;
    this.locked = locked;
    this.keyId = keyId;
  }
}

class Room {
  constructor({name, surface}) {
    this.name = name;
    this.surface = surface;

    this.exits = [];
    this.items = [];
    this.characters = [];
    this.id = Room.idCounter++;
  }

  register() {
    game.world.rooms.set(this.id, this);
  }

  broadcast(...args) {
    let filter, message;

    if (typeof args[0] == "object") {
      filter = args[0].filter;
      message = args[0].message;
    } else {
      message = args;
    }

    for (let character of this.characters) {
      if (typeof filter == "function" && !filter(character)) continue;
      character.owner.message(...message);
    }
  }

  getDirections() {
    return this.exits.map((exit) => exit.direction);
  }

  link(direction, destination, door, options = {}) {
    this.oneway(direction, destination, door, options);
    destination.oneway(Room.invertDirection(direction), this, door, options);

    return destination;
  }

  oneway(direction, destination, door, options = {}) {
    this.exits.push(new Exit(Object.assign({
      direction, destination, door
    }, options)));

    return destination;
  }

  static invertDirection(direction) {
    switch (direction) {
      case "north": return "south";
      case "south": return "north";
      case "west": return "east";
      case "east": return "west";
      case "up": return "down";
      case "down": return "up";
    }
  }

  static link(scope, firstRoomName, direction, secondRoomName) {
    let firstRoom = scope.find((room) => room.name == firstRoomName);
    let secondRoom = scope.find((room) => room.name == secondRoomName);

    firstRoom.exits[direction] = secondRoom;
    secondRoom.exits[Room.invertDirection(direction)] = firstRoom;
  }
}

Room.idCounter = 0;
Room.Exit = Exit;
Room.Door = Door;
module.exports = Room;
