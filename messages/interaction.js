module.exports = [{
  name: "Unkown Character",
  perform() {
    this.xterm.writeln({
      en: "There is no such one.",
      ru: "Здесь таких нет."
    });
  }
}, {
  name: "Private Message",
  perform({sender, message}) {
    this.xterm.writeln({
      en: `$sender tells you: "$foreground(40, $message)"`,
      ru: `$sender говорит тебе: "$foreground(40, $message)"`
    }, {sender, message});
  }
}, {
  name: "AI Message",
  perform({sender, message, answers}) {
    this.xterm.startBoxHeader();
    this.xterm.writeCharacter(sender);
    this.xterm.endln();
    this.xterm.startBoxContent();
    this.xterm.style({foreground: 40});
    if (message) this.xterm.writeText(message);

    if (answers) {
      if (message) this.xterm.writeln();

      for (let i = 0; i < answers.length; i++) {
        let answer = answers[i];

        this.xterm.style({foreground: 45});
        this.xterm.write(`[${i + 1}] `);
        this.xterm.style({foreground: 15, bold: true});
        this.xterm.writeln(answer, null, {capitalize: true});
      };

      this.xterm.reset();
    }
    this.xterm.reset();
    this.xterm.endBox();
  }
}, {
  name: "No Such Answer",
  perform() {
    this.xterm.writeln({
      en: "Type an answer number from the list below, please.",
      ru: "Ты должен ввести номер ответа из списка."
    });
  }
}, {
  name: "Doesn't Want To Talk",
  perform({character}) {
    this.xterm.writeln({
      en: "He doesn't want to talk with you.",
      ru: "Он не хочет разговаривать с тобой."
    });
  }
}, {
  name: "Nobody To Talk",
  perform() {
    this.xterm.writeln({
      en: "There is nobody to talk with.",
      ru: "Здесь не с кем пообщаться."
    });
  }
}, {
  name: "Users List",
  perform({users}) {
    this.xterm.writeln({
      en: "There are players in the game:",
      ru: "В игре находятся следующие игроки:"
    });

    for (let user of users) {
      if (!user.character) continue;
      this.xterm.writeln("  • $character ($room)", {character: user.character, room: user.character.location});
    }
  }
}, {
  name: "Say",
  perform({actor, message}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: `You say: "$message"`,
        ru: `Ты произносишь: "$foreground(40, $message)"`
      })
    } else {
      this.xterm.writeln({
        en: `$actor says: "$message".`,
        ru: `$actor произносит: "$message"`
      }, {actor, message});
    }
  }
}];
