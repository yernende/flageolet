const game = require("./game");
const Room = require("./room");

module.exports = class Character {
  constructor(user) {
    this.name = "A hero";
    this.user = user;

    this.inventory = {
      capacity: Infinity,
      items: []
    };
  }

  move(destination) {
    if (this.location) {
      this.location.characters.splice(this.location.characters.indexOf(this), 1);
    }

    destination.characters.push(this);
    this.location = destination;

    this.user.message("New Room", destination);
    this.user.message("Room Description", destination);
  }

  moveDirection(direction) {
    let destination = this.location.exits[direction];

    if (destination) {
      this.move(destination);
    } else {
      this.user.message("Unkown Direction");
    }
  }
}
