const game = require("./game");
const Character = require("./character");
const Xterm = require("./xterm");
const Command = require("./command");
const Hookable = require("./hookable");

class User extends Hookable {
  constructor(connection) {
    super();

    this.input = [];
    this.output = [];
    this.messageLinesCount = 0;
    this.xterm = new Xterm(this);
    this.connection = connection;
    this.dialog = null;
    this.resolveQueryPromise = null;

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

  catchQuery() {
    return new Promise((resolve, reject) => {
      this.resolveQueryPromise = resolve;
    });
  }

  async interpret(query) {
    let [, base, argument] = /(\S+)?(?:\s+(.+))?/.exec(query);

    if (this.resolveQueryPromise) {
      this.resolveQueryPromise(query);
      this.resolveQueryPromise = null;
      return;
    }

    if (this.dialog) {
      if (query.length == 0) {
        this.dialog.interlocutor.tell(this.character, this.dialog.message, this.dialog.answers);
        return;
      }

      let answerIndex = parseInt(query) - 1;
      let answer = this.dialog.answers[answerIndex];

      if (answer) {
        this.dialog = null;
        this.message("AI Message", {sender: this.character, message: answer});
        if (answer.handler) answer.handler(this.character);
      } else {
        this.message("No Such Answer");
      }

      return;
    }

    let command = game.commands.find((command) => command.synonyms.some((synonym) => synonym.startsWith(base)));

    if (command) {
      this.dispatchHook(`command:${command.base}:beforeInterpret`, argument);

      if (command.argument) {
        let props = command.argument.exec(argument, this);

        if (props != null) {
          this.dispatchHook(`command:${command.base}:beforeExecute`, props);
          await command.action.apply(this, props);
        }
      } else {
        this.dispatchHook(`command:${command.base}:afterExecute`, command.base);
        await command.action.call(this, command.base);
      }
    } else {
      this.message("Unkown Command");
    }
  }

  execute(commandName, ...properties) {
    return Command.execute(this, commandName, properties);
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      if (query == "\r\n") return;
      this.interpret(query.trim().toLowerCase());
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
      if (args[0]) this.xterm.register(args[0]);
      message.perform.apply(this, args);
      if (args[0]) this.xterm.variables.clear();
      this.messageLinesCount = 0;
    } else {
      throw new Error(`Unkown message ${name}`);
    }
  }
};

User.hooks = [];
module.exports = User;
