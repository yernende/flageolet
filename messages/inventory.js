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
        this.xterm.writeListMark();
        this.xterm.writeItem(item);
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
      this.xterm.write({ en: "You take ", ru: "Ты подбираешь " });
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " takes ", ru: " подбирает " });
    }

    this.xterm.writeItem(item);
    this.xterm.writeln(".");
  }
}, {
  name: "Item Dropped",
  perform(actor, item) {
    if (actor == this.character) {
      this.xterm.write({ en: "You drop ", ru: "Ты бросаешь " });
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " drops ", ru: " бросает " });
    }

    this.xterm.writeItem(item);
    this.xterm.writeln(".");
  }
}, {
  name: "Item Given",
  perform(actor, target, item) {
    if (actor == this.character) {
      this.xterm.write({ en: "You give ", ru: "Ты отдаёшь " });
    } else {
      this.xterm.writeCharacter(actor);
      this.xterm.write({ en: " gives ", ru: " даёт " });
    }

    this.xterm.writeItem(item);
    this.xterm.write({ en: " to ", ru: " " });

    if (target == this.character) {
      this.xterm.writeln({ en: "you.", ru: "тебе." });
    } else {
      this.xterm.writeCharacter(target);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Receiver's Hands Full",
  perform(receiver) {
    if (this.language == "en") {
      this.xterm.writeCharacter(receiver);
      this.xterm.writeln("'s hands are full.");
    } else if (this.language == "ru") {
      this.xterm.write("Руки ");
      this.xterm.writeCharacter(receiver);
      this.xterm.write(" полны.");
    }
  }
}];
