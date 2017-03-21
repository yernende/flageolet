const game = require("./game");
const Room = require("./room");
const AI = require("./ai");

class Character {
  constructor({name, color, owner = new AI()}) {
    this.name = name;
    this.color = color;
    this.owner = owner;
    this.owner.character = this;
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

    this.owner.message("New Room", destination);
    this.owner.message("Room Description", destination);

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
      this.owner.message("Unkown Direction");
    }
  }
}

Character.idCounter = 0;
module.exports = Character;
