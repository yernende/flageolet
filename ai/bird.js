const AI = require("../src/ai");
const Chance = require("chance");

let chance = new Chance();

module.exports = class BirdAI extends AI {
  ["Character Arrived"](character) {
    let exitChoosen = chance.pickone(this.character.location.exits);
    this.execute("go", exitChoosen);
  }
}
