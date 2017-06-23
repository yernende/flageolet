const game = require("./game");
const Character = require("./character");
const Xterm = require("./xterm");

module.exports = class User {
  constructor(connection) {
    this.input = [];
    this.output = [];
    this.messageLinesCount = 0;
    this.xterm = new Xterm(this);
    this.connection = connection;
    this.dialog = null;

    let character = new Character({
      name: {en: "a hero", ru: "герой"},
      color: 15,
      owner: this
    });

    character.isPC = true;
  }

  destroy() {
    game.users.splice(game.users.indexOf(this), 1);
    this.connection.destroy();
  }

  execute(commandName, ...props) {
    // TODO: repeated code
    let command = game.commands.find((command) => command.base == commandName);

    if (command) {
      if (command.argument) {
        return command.action.apply(this, props);
      } else {
        return command.action.call(this, command.base);
      }
    } else {
      throw new Error(`Character called unkown command ${commandName}`);
    }
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      let [, base, argument] = /(\S+)?(?:\s+(.+))?/.exec(query.trim());

      if (this.dialog) {
        let answerIndex = parseInt(query) - 1;

        let answer = this.dialog.answers[answerIndex];

        if (answer) {
          this.dialog = null;
          this.message("AI Message", this.character, answer);
          if (answer.handler) answer.handler(this.character);
        } else {
          this.message("No Such Answer");
        }

        return;
      }

      let command = game.commands.find((command) => {
        if (command.requireFullType) {
          return command.base == base;
        } else {
          return command.base.startsWith(base);
        }
      });

      if (command) {
        if (command.argument) {
          if (argument) {
            let props = command.argument.exec(argument, this);

            if (props != null) {
              command.action.apply(this, props);
            }
          } else {
            this.message("Command Needs Argument");
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
    if (this.connection.destroyed) return;

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
      this.messageLinesCount = 0;
    } else {
      throw new Error(`Unkown message ${name}`);
    }
  }
};
