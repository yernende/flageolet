module.exports = [{
  pattern: "north",
  action() {
    this.character.move("north");
  }
}, {
  pattern: "east",
  action() {
    this.character.move("east");
  }
}, {
  pattern: "south",
  action() {
    this.character.move("south");
  }
}, {
  pattern: "west",
  action() {
    this.character.move("west");
  }
}, {
  pattern: "up",
  action() {
    this.character.move("up");
  }
}, {
  pattern: "down",
  action() {
    this.character.move("down");
  }
}, {
  pattern: "look",
  action() {
    this.output.push(this.character.location.name + "\n");
  }
}];
