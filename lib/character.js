const game = require("./game");

module.exports = class Character {
  constructor(user) {
    this.name = "A hero";
    this.location = game.world[0];
    this.user = user;
  }

  move(direction) {
    let destination = this.location.exits[direction];

    if (destination) {
      this.location = destination;
    } else {
      this.user.output.push("Unkown direction\n");
    }
  }
}
