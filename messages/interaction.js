module.exports = [{
  name: "Unkown Character",
  perform(sender, message) {
    this.xterm.writeln({
      en: "There is no such one.",
      ru: "Здесь таких нет."
    });
  }
}, {
  name: "Private Message",
  perform(sender, message) {
    if (sender) {
      this.xterm.style({foreground: sender.color});
      this.xterm.writeName(sender.name);
      this.xterm.reset();
    } else {
      this.xterm.write({
        en: "Someone",
        ru: "Кто-то"
      });
    }

    this.xterm.write({
      en: " tells you: ",
      ru: " говорит тебе: "
    });

    this.xterm.style({foreground: 40});
    this.xterm.writeln(`"${message}"`);
    this.xterm.reset();
  }
}, {
  name: "AI Message",
  perform(sender, message, answers) {
    this.xterm.startBoxHeader();

    if (sender) {
      this.xterm.style({foreground: sender.color});
      this.xterm.writeName(sender.name);
      this.xterm.reset();
    } else {
      this.xterm.write({
        en: "Someone",
        ru: "Кто-то"
      });
    }

    this.xterm.endln();
    this.xterm.startBoxContent();
    this.xterm.style({foreground: 40});
    this.xterm.writeText(message);

    if (answers) {
      this.xterm.writeln();

      for (let i = 0; i < answers.length; i++) {
        let answer = answers[i];

        this.xterm.style({foreground: 45});
        this.xterm.write(`[${i + 1}] `);
        this.xterm.style({foreground: 15, bold: true});
        this.xterm.writeln(answer);
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
  perform() {
    this.xterm.writeln({
      en: "He doesn't want to talk with you.",
      ru: "Он не хочет разговаривать с тобой."
    });
  }
}, {
  name: "Users List",
  perform(users) {
    this.xterm.writeln({
      en: "There are players in the game:",
      ru: "В игре находятся следующие игроки:"
    });

    for (let user of users) {
      if (!user.character) continue;

      this.xterm.tab();
      this.xterm.write("• ");
      this.xterm.style({foreground: user.character.color, bold: true});
      this.xterm.write(user.character.name);
      this.xterm.reset();
      this.xterm.write(" (");
      this.xterm.write(user.character.location.name);
      this.xterm.writeln(")");
    }
  }
}];
