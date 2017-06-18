const AI = require("../src/ai");
const Chance = require("chance");

let chance = new Chance();

module.exports = class BirdAI extends AI {
  ["Character Arrived"](character) {
    let directionsAvailable = this.character.location.getDirections();
    let directionChosen = chance.pickone(directionsAvailable);

    this.execute(directionChosen);
  }
}
