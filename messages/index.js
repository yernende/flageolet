module.exports = [{
  name: "Unkown Command",
  perform() {
    this.xterm.writeln("Unkown command.");
  }
}, {
  name: "Prompt",
  perform() {
    this.xterm.write("> ");
  }
}];
