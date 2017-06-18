const game = require("./game");

module.exports = class AI {
  constructor() {
    this.memory = {};
  }

  message(name, ...args) {
    if (this[name]) {
      this[name](...args);
    }
  }

  execute(commandName, ...args) {
    // TODO: repeated code
    let command = game.commands.find((command) => command.base == commandName);

    if (command) {
      if (command.argument) {
        command.action.apply(this, args);
      } else {
        command.action.call(this, command.base);
      }
    } else {
      throw new Error(`AI called unkown command ${commandName}`);
    }
  }
}
