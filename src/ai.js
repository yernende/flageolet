const game = require("./game");
const Command = require("./command");

module.exports = class AI {
  constructor() {
    this.memory = {};
  }

  // Default talk handler
  ["Talk"](character) {
    character.owner.message("Doesn't Want To Talk", this.character);
  }

  tell(character, message) {
    character.owner.message("AI Message", this.character, message);
  }

  dialog(character, message, answers) {
    answers = answers.filter((answer) => typeof answer.test == "function" ? answer.test(character) : true);
    character.owner.message("AI Message", this.character, message, answers);

    character.owner.dialog = {message, answers, sender: this.character}; // TODO: entity is closed here
  }

  message(name, ...args) {
    if (this[name]) {
      this[name](...args);
    }
  }

  execute(commandName, ...properties) {
    return Command.execute(this, commandName, properties);
  }
}
