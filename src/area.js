const game = require("./game");

module.exports = class Area {
  constructor({id, name, largestRoomId, npcs, items, doors}) {
    this.id = id;
    this.name = name;
    this.largestRoomId = largestRoomId;
    this.map = [];
    this.rooms = new Map();
    this.npcs = new Map();
    this.items = new Map();
    this.doors = new Map();

    // Startup definitions stay separate from the shared, mutable game session.
    this.definitions = JSON.parse(JSON.stringify({npcs, items, doors}));
    this.spawnRoomIds = new Set([
      ...(npcs || []).map((npc) => npc.roomId),
      ...(items || []).filter((item) => item.roomId != null).map((item) => item.roomId)
    ]);
  }

  register() {
    game.world.areas.set(this.id, this);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      largestRoomId: this.largestRoomId,
      ...JSON.parse(JSON.stringify(this.definitions))
    };
  }
}
