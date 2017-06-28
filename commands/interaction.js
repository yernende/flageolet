const game = require("../src/game");

module.exports = [{
  pattern: "who",
  action() {
    this.message("Users List", game.users);
  }
}, {
  pattern: "talk <character?>",
  action(target) {
    if (!target) {
      for (let character of this.character.location.characters) {
        if (character.isNPC && character.owner && typeof character.owner["Talk"] == "function") {
          target = character;
        }
      }
    }

    if (!target) {
      return this.message("Nobody To Talk");
    }

    if (target.isNPC) {
      target.owner.message("Talk", this.character);
    }
  }
}];
