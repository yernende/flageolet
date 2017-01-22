module.exports = [{
  pattern: "north",
  action() {
    this.character.moveDirection("north");
  }
}, {
  pattern: "east",
  action() {
    this.character.moveDirection("east");
  }
}, {
  pattern: "south",
  action() {
    this.character.moveDirection("south");
  }
}, {
  pattern: "west",
  action() {
    this.character.moveDirection("west");
  }
}, {
  pattern: "up",
  action() {
    this.character.moveDirection("up");
  }
}, {
  pattern: "down",
  action() {
    this.character.moveDirection("down");
  }
}, {
  pattern: "look",
  action() {
    this.message("Room Description", this.character.location);
  }
}];
