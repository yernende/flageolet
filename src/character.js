const game = require("./game");
const Room = require("./room");

class Character {
  constructor(user) {
    this.name = "a hero";
    this.user = user;
    this.id = Character.idCounter++;

    this.inventory = {
      capacity: Infinity,
      items: []
    };
  }

  register() {
    game.world.characters.set(this.id, this);
  }

  move(destination) {
    if (this.location) {
      this.location.characters.splice(this.location.characters.indexOf(this), 1);
    }

    destination.characters.push(this);
    this.location = destination;

    this.user.message("New Room", destination);
    this.user.message("Room Description", destination);

    this.location.broadcast({
      filter: (target) => target != this,
      message: ["Character Arrived", this]
    });
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

Character.idCounter = 0;
module.exports = Character;
