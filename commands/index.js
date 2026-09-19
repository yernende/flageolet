const game = require("../src/game");

module.exports = [{
  pattern: "language <string:(en|ru)>",
  action(language) {
    this.language = language.toLowerCase();
    this.message("Language Switched");
  }
}, {
  pattern: "commands",
  action() {
    this.message("Commands List", {commands: game.commands});
  }
}, {
  pattern: "quit",
  requireFullType: true,
  action() {
    this.destroy();
  }
}];
