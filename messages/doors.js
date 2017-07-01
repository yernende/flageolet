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
  perform({actor, door}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You open the $door.",
        ru: "Ты открываешь $accusative($door)."
      });
    } else {
      this.xterm.writeln({
        en: "$actor opens the $door.",
        ru: "$actor открывает $accusative($door)."
      });
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
  perform({actor, door}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You close the $door.",
        ru: "Ты закрываешь $accusative($door)."
      });
    } else {
      this.xterm.writeln({
        en: "$actor closes $door.",
        ru: "$actor закрывает $accusative($door)."
      });
    }
  }
}, {
  name: "No Key",
  perform({door}) {
    this.xterm.writeln({
      en: "No key to open the $door.",
      ru: "У тебя нет ключа, чтобы открыть $accusative($door)."
    });
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
  perform({actor, door}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You unlock the $door.",
        ru: "Ты отпираешь $accusative($door)."
      });
    } else {
      this.xterm.writeln({
        en: "$actor unlocks a $door.",
        ru: "$actor отпирает $accusative($door)."
      });
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
  perform({actor, door}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You lock the $door.",
        ru: "Ты запираешь $accusative($door)."
      });
    } else {
      this.xterm.writeln({
        en: "$actor locks a $door.",
        ru: "$actor запирает $accusative($door)."
      });
    }
  }
}];
