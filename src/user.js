const game = require("./game");
const Character = require("./character");
const Xterm = require("./xterm");

module.exports = class User {
  constructor(connection) {
    this.input = [];
    this.output = [];
    this.xterm = new Xterm(this);
    this.connection = connection;

    new Character({
      name: {en: "a hero", ru: "герой"},
      color: 15,
      owner: this
    });
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      let [, base, argument] = /(\S+)?(?:\s+(.+))?/.exec(query.trim());
      let command = game.commands.find((command) => command.base.startsWith(base));

      if (command) {
        if (command.argument) {
          let props = command.argument.exec(argument, this);

          if (props != null) {
            command.action.apply(this, props);
          }
        } else {
          command.action.call(this, command.base);
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
