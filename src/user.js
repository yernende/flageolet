const game = require("./game");
const Character = require("./character");
const Xterm = require("./xterm");
const Command = require("./command");
const Hookable = require("./hookable");
const {StringDecoder} = require("string_decoder");

class User extends Hookable {
  constructor(connection) {
    super();

    this.input = [];
    this.inputBuffer = "";
    this.inputEnded = false;
    this.pendingCommands = 0;
    this.decoder = new StringDecoder("utf8");
    this.closed = false;
    this.output = [];
    this.messageLinesCount = 0;
    this.xterm = new Xterm(this);
    this.connection = connection;
    this.dialog = null;
    this.resolveQueryPromise = null;
    this.rejectQueryPromise = null;

    this.character = new Character({
      name: {en: "a hero", ru: "герой"},
      color: 15,
      owner: this
    });

    this.character.isPC = true;
  }

  destroy({graceful = false} = {}) {
    if (this.closed) return;
    this.closed = true;
    this.input = [];
    this.inputBuffer = "";
    this.dialog = null;

    if (this.rejectQueryPromise) {
      this.rejectQueryPromise(new Error("Player disconnected."));
      this.resolveQueryPromise = null;
      this.rejectQueryPromise = null;
    }

    let index = game.users.indexOf(this);
    if (index >= 0) game.users.splice(index, 1);

    try {
      let room = this.character.location;
      if (room) {
        for (let item of [...this.character.inventory.items]) item.move(room);
        this.character.destroy();
        room.broadcast("Character Left Game", {character: this.character});
      }
    } finally {
      if (graceful && !this.connection.destroyed && typeof this.connection.end == "function") {
        this.connection.end();
      } else {
        this.connection.destroy();
      }
    }
  }

  receive(data) {
    if (this.closed || this.inputEnded) return;
    this.inputBuffer += typeof data == "string" ? data : this.decoder.write(data);

    let newline;
    while ((newline = this.inputBuffer.indexOf("\n")) >= 0) {
      let line = this.inputBuffer.slice(0, newline);
      this.input.push(line.endsWith("\r") ? line.slice(0, -1) : line);
      this.inputBuffer = this.inputBuffer.slice(newline + 1);
    }
  }

  endInput() {
    if (this.closed || this.inputEnded) return;
    this.inputEnded = true;
    // An EOF is not a command terminator: keep only complete queued lines.
    this.inputBuffer = "";
    this.decoder.end();
    this.finishInput();
  }

  finishInput() {
    if (this.closed || !this.inputEnded || this.input.length > 0) return;
    // Cancel an unanswered prompt, but let any other asynchronous work finish.
    if (this.rejectQueryPromise) {
      let reject = this.rejectQueryPromise;
      this.resolveQueryPromise = null;
      this.rejectQueryPromise = null;
      let error = new Error("Input ended before all replies were received.");
      error.code = "INPUT_ENDED";
      reject(error);
    }
    if (this.pendingCommands > 0) return;
    this.handleOutput();
    this.destroy({graceful: true});
  }

  catchQuery() {
    return new Promise((resolve, reject) => {
      if (this.closed) return reject(new Error("Player disconnected."));
      this.resolveQueryPromise = resolve;
      this.rejectQueryPromise = reject;
      this.finishInput();
    });
  }

  async interpret(query) {
    if (this.closed) return;
    query = query.trim();

    if (this.resolveQueryPromise) {
      let resolve = this.resolveQueryPromise;
      this.resolveQueryPromise = null;
      this.rejectQueryPromise = null;
      resolve(query);
      return;
    }

    if (this.dialog) {
      if (query.length == 0) {
        this.dialog.interlocutor.tell(this.character, this.dialog.message, this.dialog.answers);
        return;
      }

      let answerIndex = /^\d+$/.test(query) ? Number(query) - 1 : -1;
      let answer = this.dialog.answers[answerIndex];

      if (answer) {
        this.dialog = null;
        this.message("AI Message", {sender: this.character, message: answer});
        if (answer.handler) await answer.handler(this.character);
      } else {
        this.message("No Such Answer");
      }

      return;
    }

    if (query.length == 0) return;
    let [, base, argument] = /^(\S+)(?:\s+(.+))?$/.exec(query);
    base = base.toLowerCase();
    let command = game.commands.find((command) => command.synonyms.some(
      (synonym) => command.requireFullType ? synonym == base : synonym.startsWith(base)
    ));

    if (command) {
      this.dispatchHook(`command:${command.base}:beforeInterpret`, argument);

      if (command.argument) {
        let props = command.argument.exec(argument, this);

        if (props != null) {
          this.dispatchHook(`command:${command.base}:beforeExecute`, props);
          await command.action.apply(this, props);
          this.dispatchHook(`command:${command.base}:afterExecute`, props);
        }
      } else {
        this.dispatchHook(`command:${command.base}:beforeExecute`, command.base);
        await command.action.call(this, command.base);
        this.dispatchHook(`command:${command.base}:afterExecute`, command.base);
      }
    } else {
      this.message("Unkown Command");
    }
  }

  execute(commandName, ...properties) {
    return Command.execute(this, commandName, properties);
  }

  handleInput() {
    if (!this.closed && this.input.length > 0) {
      let query = this.input.shift();
      this.xterm.newLine = true;
      this.pendingCommands++;
      let command = this.interpret(query).catch((error) => {
        if (this.closed || (this.inputEnded && error && error.code == "INPUT_ENDED")) return;
        console.error(error);
        this.message("Command Failed");
      }).finally(() => {
        this.pendingCommands--;
        this.finishInput();
      });
      this.finishInput();
      return command;
    }
    this.finishInput();
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
    if (this.closed) return;
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
}

User.hooks = [];
module.exports = User;
