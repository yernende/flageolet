module.exports = [{
  name: "New Room",
  perform() {
    this.output.push("═".repeat(80) + "\n");
  }
}, {
  name: "Room Description",
  perform(room) {
    this.output.push("  " + room.name + "\n");
  }
}, {
  name: "Unkown Direction",
  perform() {
    this.output.push("Unkown direction.\n");
  }
}, {
  name: "Unkown Command",
  perform() {
    this.output.push("Unkown command.\n");
  }
}]
