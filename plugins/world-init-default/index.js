const fs = require("fs");
const path = require("path");

module.exports = function worldInitDefaultPlugin({Area, Room, Character, Item, game}) {
  for (let file of fs.readdirSync(path.join(__dirname, "../../areas"))) {
    let areaPath = path.join(__dirname, "../../areas", file);

    // Load area data
    let area = new Area(require(path.join(areaPath, "area.json")));
    area.folderName = file;
    area.register();

    // Load rooms
    for (let roomProperties of require(path.join(areaPath, "rooms.json"))) {
      let room = new Room(roomProperties);
      room.register(area, roomProperties.id);
    }

    // Load map
    for (let cellData of require(path.join(areaPath, "map.json"))) {
      let mapCell = new Room.MapCell(cellData);
      mapCell.register(area, cellData.roomId);

      for (let exit of cellData.exits) {
        let destination = area.rooms.get(exit.destinationId);
        Room.link(mapCell.room, destination, exit.direction, null, null);
      }

      area.map.push(mapCell);
    }
  }
}
