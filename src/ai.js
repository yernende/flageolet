const game = require("./game");
const Command = require("./command");

module.exports = class AI {
  constructor() {
    this.memory = {};
  }

  // Default talk handler
  ["Talk"](character) {
    character.owner.message("Doesn't Want To Talk", {character: this.character});
  }

  tell(character, message, answers) {
    character.owner.message("AI Message", {sender: this.character, message, answers});
  }

  dialog(character, message, answers) {
    answers = answers.filter((answer) => typeof answer.test == "function" ? answer.test(character) : true);
    this.tell(character, message, answers);
    character.owner.dialog = {message, answers, interlocutor: this}; // TODO: entity is closed here
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
