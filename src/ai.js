const game = require("./game");

module.exports = class AI {
  constructor() {
    this.memory = {};
  }

  tell(character, message) {
    character.owner.message("AI Message", this.character, message);
  }

  dialog(character, message, answers) {
    answers = answers.filter((answer) => typeof answer.test == "function" ? answer.test(character) : true);
    character.owner.message("AI Message", this.character, message, answers);

    character.owner.dialog = {message, answers};
  }

  message(name, ...args) {
    if (this[name]) {
      this[name](...args);
    }
  }

  execute(commandName, ...props) {
    // TODO: repeated code
    let command = game.commands.find((command) => command.base == commandName);

    if (command) {
      if (command.argument) {
        command.action.apply(this, props);
      } else {
        command.action.call(this, command.base);
      }
    } else {
      throw new Error(`AI called unkown command ${commandName}`);
    }
  }
}
