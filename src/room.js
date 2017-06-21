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

    let characters = this.characters.sort((character) => character.isPC ? -1 : 1)

    for (let character of characters) {
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

  getRoomToDirection(direction) {
    let exit = this.exits.find((exit) => exit.direction == direction);
    return exit ? exit.destination : null;
  }

  get north() {
    return this.getRoomToDirection("north");
  }

  get south() {
    return this.getRoomToDirection("south");
  }

  get west() {
    return this.getRoomToDirection("west");
  }

  get east() {
    return this.getRoomToDirection("east");
  }

  get up() {
    return this.getRoomToDirection("up");
  }

  get down() {
    return this.getRoomToDirection("down");
  }
}

Room.idCounter = 0;
Room.Exit = Exit;
Room.Door = Door;
module.exports = Room;
