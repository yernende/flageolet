module.exports = [{
  name: "Door Is Closed",
  perform() {
    this.xterm.writeln({
      en: "The passage is closed.",
      ru: "Проход закрыт."
    });
  }
}, {
  name: "No Door",
  perform() {
    this.xterm.writeln({
      en: "There is no door.",
      ru: "Там нет двери."
    });
  }
}, {
  name: "Door Already Opened",
  perform() {
    this.xterm.writeln({
      en: "That door is already opened.",
      ru: "Эта дверь уже открыта."
    });
  }
}, {
  name: "Door Opened",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({ en: "You open ", ru: "Ты открываешь " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " opens ", ru: " открывает " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Door Already Closed",
  perform() {
    this.xterm.writeln({
      en: "That door is already closed.",
      ru: "Эта дверь уже закрыта."
    });
  }
}, {
  name: "Door Closed",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({ en: "You close ", ru: "Ты закрываешь " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " closes ", ru: " закрывает " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "No Key",
  perform(door) {
    this.xterm.write({
      en: "No key to open ",
      ru: "У тебя нет ключа, чтобы открыть "
    });

    this.xterm.write(door.name);
    this.xterm.writeln(".");
  }
}, {
  name: "Door Already Unlocked",
  perform() {
    this.xterm.writeln({
      en: "That door is already unlocked.",
      ru: "Эта дверь уже отперта."
    });
  }
}, {
  name: "Door Unlocked",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({ en: "You unlock ", ru: "Ты отпираешь " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " unlocks ", ru: " отпирает " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Door Already Locked",
  perform() {
    this.xterm.writeln({
      en: "That door is already locked.",
      ru: "Эта дверь уже заперта."
    });
  }
}, {
  name: "Door Locked",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({ en: "You lock ", ru: "Ты запираешь " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " locks ", ru: " запирает " });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}];
