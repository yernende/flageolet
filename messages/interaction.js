module.exports = [{
  name: "Unkown Item",
  perform() {
    this.xterm.writeln("There is no such item.");
  }
}, {
  name: "Inventory Filled",
  perform() {
    this.xterm.writeln("You can't carry that many items.");
  }
}, {
  name: "Inventory",
  perform(inventory) {
    if (inventory.items.length > 0) {
      this.xterm.writeln(`You are carrying:`);

      for (let item of inventory.items) {
        this.xterm.tab();
        this.xterm.write("• ");
        this.xterm.style({foreground: item.color, bold: true});
        this.xterm.write(item.name);
        this.xterm.reset();
        this.xterm.writeln();
      }
    } else {
      this.xterm.writeln("You aren't carrying anything.");
    }
  }
}, {
  name: "Item Taken",
  perform(item) {
    this.xterm.write("You take ");
    this.xterm.style({foreground: item.color, bold: true});
    this.xterm.write(item.name);
    this.xterm.reset();
    this.xterm.writeln(".");
  }
}, {
  name: "Item Dropped",
  perform(item) {
    this.xterm.write("You drop ");
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
      this.xterm.write("Someone");
    }

    this.xterm.write(` tells you: `);
    this.xterm.style({foreground: 40});
    this.xterm.writeln(`"${message}"`);
    this.xterm.reset();
  }
}];
