const game = require("./game");

module.exports = class Character {
  constructor(user) {
    this.name = "A hero";
    this.location = game.world.rooms[0];
    this.user = user;
  }

  move(direction) {
    let destination = this.location.exits[direction];

    if (destination) {
      this.location = destination;
      this.user.message("New Room", destination);
      this.user.message("Room Description", destination);
    } else {
      this.user.message("Unkown Direction");
    }
  }
}
