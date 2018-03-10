const fs = require("fs");
const path = require("path");
const util = require("util");
const game = require("../../src/game");

const writeFileAsync = util.promisify(fs.writeFile);
const stringify = (object) => JSON.stringify(object, null, "  ");

module.exports = async function saveWorld() {
  for (let area of game.world.areas.values()) {
    let areaPath = path.join(__dirname, "../../areas", area.folderName);

    await [
      writeFileAsync(path.join(areaPath, "area.json"), stringify(area.serialize())),
      writeFileAsync(path.join(areaPath, "rooms.json"), stringify([...area.rooms.values()].map((room) => room.serialize()))),
      writeFileAsync(path.join(areaPath, "map.json"), stringify(area.map.map((cell) => cell.serialize())))
    ];
  }
}
