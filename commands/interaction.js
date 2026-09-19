const game = require("../src/game");
const AI = require("../src/ai");

module.exports = [{
  pattern: "who",
  action() {
    this.message("Users List", {users: game.users});
  }
}, {
  pattern: "talk <character?>",
  action(target) {
    if (!target) {
      let candidates = this.character.location.characters.filter((character) =>
        character.isNPC && character.owner && typeof character.owner["Talk"] == "function");
      target = candidates.find((character) => character.owner["Talk"] !== AI.prototype["Talk"])
        || candidates[0];
    }

    if (!target) {
      return this.message("Nobody To Talk");
    }

    if (target.isNPC) {
      target.owner.message("Talk", {character: this.character});
    }
  }
}, {
  pattern: "say <string greedy>",
  action(message) {
    this.character.location.broadcast("Say", {actor: this.character, message});
  }
}];
