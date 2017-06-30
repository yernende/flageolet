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
  perform({inventory}) {
    if (inventory.items.length > 0) {
      this.xterm.writeln({
        en: "You are carrrying:",
        ru: "Ты несёшь:"
      });

      for (let item of inventory.items) {
        this.xterm.writeln("  • $item", {item});
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
  perform({actor, item}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You take $item.",
        ru: "Ты подбираешь $item."
      });
    } else {
      this.xterm.writeln({
        en: "$actor takes $item.",
        ru: "$actor подбирает $item."
      });
    }
  }
}, {
  name: "Item Dropped",
  perform({actor, item}) {
    if (actor == this.character) {
      this.xterm.writeln({
        en: "You drop $item.",
        ru: "Ты бросаешь $item."
      });
    } else {
      this.xterm.writeln({
        en: "$character drops $item.",
        ru: "$character бросает $item."
      });
    }
  }
}, {
  name: "Item Given",
  perform({actor, target, item}) {
    if (this.character == actor) {
      this.xterm.writeln({
        en: "You give $item to $target.",
        ru: "Ты отдаёшь $item $target."
      });
    } else if (this.character == target) {
      this.xterm.writeln({
        en: "$actor gives $item to you.",
        ru: "$actor даёт тебе $item."
      });
    } else {
      this.xterm.writeln({
        en: "$actor gives $item to $target.",
        ru: "$actor отдаёт $item $target."
      });
    }
  }
}, {
  name: "Receiver's Hands Full",
  perform({receiver}) {
    this.xterm.writeln({
      en: "$receiver's hands are full.",
      ru: "Руки $receiver полны."
    });
  }
}];
