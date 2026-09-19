const AI = require("../src/ai");

module.exports = class BirdAI extends AI {
  ["Character Arrived"]() {
    let exits = this.character.location.exits;
    if (exits.length == 0) return;

    let exit = exits[Math.floor(Math.random() * exits.length)];
    this.execute("go", exit);
  }
};
