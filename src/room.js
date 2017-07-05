const game = require("./game");

class Exit {
  constructor({direction, destination, door, oneway}) {
    this.direction = direction;
    this.destination = destination;
    this.door = door;
    this.oneway = oneway;
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

  registerAsCentralRoom() {
    game.world.map.push({x: 0, y: 0, z: 0, room: this});
  }

  broadcast(...args) {
    let filter, message, data;

    if (typeof args[0] == "object") {
      filter = args[0].filter;
      message = args[0].message;
      data = args[0].data;
    } else {
      message = args[0], data = args[1];
    }

    let characters = this.characters.sort((character) => character.isPC ? -1 : 1)

    for (let character of characters) {
      if (typeof filter == "function" && !filter(character)) continue;
      character.owner.message(message, data);
    }
  }

  getDirections() {
    return this.exits.map((exit) => exit.direction);
  }

  link(direction, destination, door, options = {}) {
    createCellAtMap(this, destination, direction);
    link(this, destination, direction, door, Object.assign({oneway: false}, options));
    link(destination, this, Room.invertDirection(direction), door, Object.assign({oneway: false}, options));

    return destination;
  }

  oneway(direction, destination, door, options = {}) {
    createCellAtMap(this, destination, direction);
    link(this, destination, direction, door, Object.assign({oneway: true}, options));

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

function createCellAtMap(baseRoom, destination, direction) {
  let baseRoomCellAtMap = game.world.map.find((cell) => cell.room == baseRoom);

  if (baseRoomCellAtMap) {
    let {x, y, z} = baseRoomCellAtMap;

    switch (direction) {
      case "north": y++; break;
      case "south": y--; break;
      case "east": x++; break;
      case "west": x--; break;
      case "up": z++; break;
      case "down": z--; break;
    }

    game.world.map.push({x, y, z, room: destination});
  }
}

function link(baseRoom, destination, direction, door, options) {
  baseRoom.exits.push(new Exit(Object.assign({
    direction, destination, door
  }, options)));
}
