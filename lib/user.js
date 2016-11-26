const game = require("./game");
const Character = require("./character");

module.exports = class User {
  constructor(connection) {
    this.input = [];
    this.output = [];
    this.character = new Character(this);
    this.connection = connection;
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      let [, base, argument] = /(\S+)?(?:\s+(.+))?/.exec(query);
      let command = game.commands.find((command) => command.base == base);

      if (command) {
        if (command.argument) {
          let props = command.argument.exec(argument);
          command.action.apply(this, props);
        } else {
          command.action.apply(this);
        }
      } else {
        this.output.push("Unkown command.\n")
      }
    }
  }

  handleOutput() {
    this.connection.write(this.output.join(""));
    this.output = [];
  }
};
