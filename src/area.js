const game = require("./game");

module.exports = class Area {
  constructor({id, name}) {
    this.id = id;
    this.name = name;
    this.map = [];
    this.rooms = new Map();
  }

  register() {
    game.world.areas.set(this.id, this);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name
    };
  }
}
