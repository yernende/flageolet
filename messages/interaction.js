module.exports = [{
  name: "Unkown Item",
  perform() {
    this.xterm.writeln({
      en: "There is no such item.",
      ru: "Здесь нет таких вещей."
    });
  }
}, {
  name: "Inventory Filled",
  perform() {
    this.xterm.writeln({
      en: "You can't carry that many items.",
      ru: "Ты не можешь нести столько вещей."
    });
  }
}, {
  name: "Inventory",
  perform(inventory) {
    if (inventory.items.length > 0) {
      this.xterm.writeln({
        en: "You are carrrying:",
        ru: "Ты несёшь:"
      });

      for (let item of inventory.items) {
        this.xterm.tab();
        this.xterm.write("• ");
        this.xterm.style({foreground: item.color, bold: true});
        this.xterm.write(item.name);
        this.xterm.reset();
        this.xterm.writeln();
      }
    } else {
      this.xterm.writeln({
        en: "You aren't carrying anything.",
        ru: "Инвентарь пуст."
      });
    }
  }
}, {
  name: "Item Taken",
  perform(actor, item) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You take ",
        ru: "Ты подбираешь "
      });
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " takes ",
        ru: " подбирает "
      });
    }

    this.xterm.style({foreground: item.color, bold: true});
    this.xterm.write(item.name);
    this.xterm.reset();
    this.xterm.writeln(".");
  }
}, {
  name: "Item Dropped",
  perform(actor, item) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You drop ",
        ru: "Ты бросаешь "
      });
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " drops ",
        ru: " бросает "
      });
    }

    this.xterm.style({foreground: item.color, bold: true});
    this.xterm.write(item.name);
    this.xterm.reset();
    this.xterm.writeln(".");
  }
}, {
  name: "Item Given",
  perform(actor, target, item) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You give ",
        ru: "Ты отдаёшь "
      });
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " gives ",
        ru: " даёт "
      });
    }

    this.xterm.style({foreground: item.color, bold: true});
    this.xterm.write(item.name);
    this.xterm.reset();

    this.xterm.write({
      en: " to ",
      ru: " "
    });

    if (target == this.character) {
      this.xterm.writeln({
        en: "you.",
        ru: "тебе."
      });
    } else {
      this.xterm.style({foreground: target.color, bold: true});
      this.xterm.write(target.name);
      this.xterm.reset();
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Receiver's Hands Full",
  perform(receiver) {
    if (this.language == "en") {
      this.xterm.style({foreground: target.color, bold: true});
      this.xterm.write(target.name);
      this.xterm.reset();
      this.xterm.writeln("'s hands are full.");
    } else if (this.language == "ru") {
      this.xterm.write("Руки ");
      this.xterm.style({foreground: target.color, bold: true});
      this.xterm.write(target.name);
      this.xterm.reset();
      this.xterm.write(" пусты.");
    }
  }
}, {
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
