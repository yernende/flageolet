const game = require("./game");
const Character = require("./character");
const Xterm = require("./xterm");

module.exports = class User {
  constructor(connection) {
    this.input = [];
    this.output = [];
    this.character = new Character("A hero", 15, this);
    this.xterm = new Xterm(this);
    this.connection = connection;
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      let [, base, argument] = /(\S+)?(?:\s+(.+))?/.exec(query);
      let command = game.commands.find((command) => command.base.startsWith(base));

      if (command) {
        if (command.argument) {
          let props = command.argument.exec(argument);
          command.action.apply(this, props);
        } else {
          command.action.apply(this);
        }
      } else {
        this.message("Unkown Command");
      }
    }
  }

  handleOutput() {
    if (this.output.length > 0) {
      this.message("Prompt");
      this.connection.write(this.output.join(""));
      this.output = [];
    }
  }

  message(name, ...args) {
    let message = game.messages.find((message) => message.name == name);

    if (message) {
      message.perform.apply(this, args);
    } else {
      throw new Error(`Unkown message ${name}`);
    }
  }
};
