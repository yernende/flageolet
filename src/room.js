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

class MapCell {
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;

    this.room = null;
  }

  register(area, roomId) {
    this.room = area.rooms.get(roomId);
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      roomId: this.room.id,
      exits: this.room.exits.map((exit) => ({
        direction: exit.direction,
        destinationId: exit.destination.id
      }))
    };
  }

  destroy() {
    let area = this.room.area;
    area.map.splice(area.map.indexOf(this), 1);
  }
}

class Room {
  constructor({name, surface, id}) {
    this.name = name;
    this.surface = surface;

    this.exits = [];
    this.items = [];
    this.characters = [];
  }

  register(area, id) {
    this.area = area;
    this.id = id;
    area.rooms.set(id, this);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      surface: this.surface
    };
  }

  destroy() {
    for (let character of this.characters) {
      if (character.isPC) character.execute("recall");
      if (character.isNPC) throw new Error("Cannot delete a room with an NPC.");
    }

    for (let room of this.area.rooms.values()) {
      room.exits = room.exits.filter((exit) => exit.destination != this);
    }

    this.area.rooms.delete(this.id);
  }

  destroyMapCell() {
    for (let mapCell of this.area.map) {
      if (mapCell.room == this) {
        mapCell.destroy();
      }
    }
  }

  registerAsCentralRoom() {
    this.area.map.push({x: 0, y: 0, z: 0, room: this});
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

  static calculateCoordinates(baseRoom, direction) {
    let baseRoomCellAtMap = baseRoom.area.map.find((cell) => cell.room == baseRoom);

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

      return {x, y, z};
    } else {
      return null;
    }
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
Room.MapCell = MapCell;
module.exports = Room;

function createCellAtMap(baseRoom, destination, direction) {
  let coordinates = Room.calculateCoordinates(baseRoom, direction);

  if (!baseRoom.area.map.some(({x, y, z}) => x == coordinates.x && y == coordinates.y && z == coordinates.z)) {
    let mapCell = new MapCell(coordinates);

    mapCell.register(baseRoom.area, destination.id);
    baseRoom.area.map.push(mapCell);
  }
}

function link(baseRoom, destination, direction, door, options) {
  if (!baseRoom.exits.some((exit) => exit.direction == direction)) {
    baseRoom.exits.push(new Exit(Object.assign({
      direction, destination, door
    }, options)));
  }
}

Room.link = link;
