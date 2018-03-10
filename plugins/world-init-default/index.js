const fs = require("fs");
const path = require("path");

module.exports = function worldInitDefaultPlugin({Area, Room, Character, Item, game}) {
  for (let file of fs.readdirSync(path.join(__dirname, "../../areas"))) {
    let areaPath = path.join(__dirname, "../../areas", file);

    // Load area data
    let area = new Area(require(path.join(areaPath, "area.json")));
    area.register();

    // Load rooms
    for (let roomProperties of require(path.join(areaPath, "rooms.json"))) {
      let room = new Room(roomProperties);
      room.register(area);
    }

    // Load map
    let map = require(path.join(areaPath, "map.json"));
    for (let cellData of map) {
      cellData.room = area.rooms.get(cellData.roomId);

      for (let exit of cellData.exits) {
        let destination = area.rooms.get(exit.destinationId);
        Room.link(cellData.room, destination, exit.direction, null, null);
      }
    }
    area.map = map;
  }
}
