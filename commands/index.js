const game = require("../src/game");

module.exports = [{
  pattern: "language <string:(en|ru)>",
  action(language) {
    this.language = language;
    this.message("Language Switched");
  }
}, {
  pattern: "commands",
  action() {
    this.message("Commands List", game.commands);
  }
}];
