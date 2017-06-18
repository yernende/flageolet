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
}, {
  pattern: "quit",
  requireFullType: true,
  action() {
    this.character.location.broadcast("Character Left Game", this.character);
    this.character.destroy();
    this.destroy();
  }
}];
