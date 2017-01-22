module.exports = class Room {
  constructor(name) {
    this.name = name;
    this.exits = {north: null, east: null, south: null, west: null, up: null, down: null};
    this.items = [];
    this.characters = [];
  }

  broadcast({filter, message}) {
    for (let character of this.characters) {
      if (typeof filter == "function" && filter(character)) {
        character.user.message(...message);
      }
    }
  }

  getDirections() {
    return ["north", "east", "south", "west", "up", "down"].filter((direction) => this.exits[direction] != null);
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
