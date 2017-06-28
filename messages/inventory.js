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
