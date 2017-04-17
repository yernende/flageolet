const game = require("./game");

class Room {
  constructor({name, surface}) {
    this.name = name;
    this.surface = surface;

    this.exits = {north: null, east: null, south: null, west: null, up: null, down: null};
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
    return ["north", "east", "south", "west", "up", "down"].filter((direction) => this.exits[direction] != null);
  }

  link(direction, destination) {
    this.exits[direction] = destination;
    destination.exits[Room.invertDirection(direction)] = this;
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
module.exports = Room;
