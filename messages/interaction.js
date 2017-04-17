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
  perform(sender, message) {
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
    this.xterm.reset();
    this.xterm.endBox();
  }
}];
