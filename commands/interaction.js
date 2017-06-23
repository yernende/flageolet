const game = require("../src/game");

module.exports = [{
  pattern: "who",
  action() {
    this.message("Users List", game.users);
  }
}, {
  pattern: "talk <character>",
  action(target) {
    if (target.isNPC) {
      target.owner.message("Talk", this.character);
    }
  }
}];
