module.exports = [{
  name: "New Room",
  perform() {
    this.xterm.writeln("═".repeat(80));
  }
}, {
  name: "Room Description",
  perform(room) {
    this.xterm.tab();
    this.xterm.style({foreground: 15, bold: true});
    this.xterm.writeln(room.name);
    this.xterm.reset();
  }
}, {
  name: "Unkown Direction",
  perform() {
    this.xterm.writeln("Unkown direction.");
  }
}];
