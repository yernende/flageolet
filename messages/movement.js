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
    this.xterm.tab();
    this.xterm.write("Exits: ");

    let directions = room.getDirections();

    directions.forEach((exit, index) => {
      this.xterm.style({foreground: 45});
      this.xterm.write(exit);
      this.xterm.reset();

      if (index != directions.length - 1) {
        this.xterm.write(", ");
      }
    });

    this.xterm.writeln(".");
    this.xterm.writeln();
  }
}, {
  name: "Unkown Direction",
  perform() {
    this.xterm.writeln("Unkown direction.");
  }
}];
