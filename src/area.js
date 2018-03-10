const game = require("./game");

module.exports = class Area {
  constructor({id, name, largestRoomId}) {
    this.id = id;
    this.name = name;
    this.largestRoomId = largestRoomId;
    this.map = [];
    this.rooms = new Map();
  }

  register() {
    game.world.areas.set(this.id, this);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      largestRoomId: this.largestRoomId
    };
  }
}
