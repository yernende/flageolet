module.exports = [{
  name: "New Room",
  perform() {
    this.xterm.writeln("═".repeat(80));
  }
}, {
  name: "Room Description",
  perform(room) {
    // Room name
    this.xterm.tab();
    this.xterm.style({foreground: 15, bold: true});
    this.xterm.writeln(room.name);
    this.xterm.reset();

    // Room description
    this.xterm.tab();
    this.xterm.writeln("Lorem ipsum dolor sit amet, consectetur adipisicing");
    this.xterm.writeln("sed do eiusmod tempor incididunt ut labore et dolore");
    this.xterm.writeln("aliqua. Ut enim ad minim veniam, quis nostrud ullamco");
    this.xterm.writeln("laboris nisi ut aliquip ex ea commodo consequat.");
    this.xterm.writeln();

    // Exits
    let directions = room.getDirections();

    if (directions.length > 0) {
      this.xterm.tab();
      this.xterm.write("Exits: ");

      directions.forEach((exit, index) => {
        this.xterm.style({foreground: 45});
        this.xterm.write(exit);
        this.xterm.reset();

        if (index != directions.length - 1) {
          this.xterm.write(", ");
        }
      });

      this.xterm.writeln(".");
    } else {
      this.xterm.tab();
      this.xterm.writeln("No exits.")
    }

    // Items
    if (room.items.length > 0) {
      this.xterm.writeln();

      for (let item of room.items) {
        this.xterm.tab();
        this.xterm.write("• ");
        this.xterm.style({foreground: item.color, bold: true});
        this.xterm.write(item.name);
        this.xterm.reset();
        this.xterm.writeln();
      }
    }
  }
}, {
  name: "Unkown Direction",
  perform() {
    this.xterm.writeln("Unkown direction.");
  }
}, {
  name: "Character Arrived",
  perform(character) {
    this.xterm.writeName(character.name);
    this.xterm.writeln(" has arrived.");
  }
}, {
  name: "Room List",
  perform(rooms) {
    this.xterm.writeln("There are rooms in the world:");
    this.xterm.writeln();

    for (let [id, room] of rooms) {
      this.xterm.write(`[${room.id}] `);
      this.xterm.style({foreground: 15, bold: true});
      this.xterm.write(`${room.name}`)
      this.xterm.reset();
      this.xterm.writeln();
    }
  }
}, {
  name: "Unknown Room Id",
  perform() {
    this.xterm.writeln("There is no such room in the world.");
  }
}];
