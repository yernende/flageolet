const game = require("./game");
const Room = require("./room");
const AI = require("./ai");

class Character {
  constructor({name, color = 16, keywords, owner = new AI()}) {
    this.name = name;
    this.color = color;
    this.owner = owner;
    this.owner.character = this;
    this.id = Character.idCounter++;

    // TODO: repeated code
    if (!keywords) {
      if (typeof name == "string") {
        keywords = name.split(" ");
      } else if (typeof name == "object") {
        keywords = [];

        for (let nameString of Object.values(name)) {
          keywords.push(...nameString.split(" "));
        }
      }
    }

    this.keywords = keywords;
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
  }

  moveDirection(direction) {
    let destination = this.location.exits[direction];

    if (destination) {
      this.location.broadcast({
        filter: (target) => target != this,
        message: ["Character Left", this, direction]
      });

      this.move(destination);

      this.location.broadcast({
        filter: (target) => target != this,
        message: ["Character Arrived", this]
      });
    } else {
      this.owner.message("Unkown Direction");
    }
  }
}

Character.idCounter = 0;
module.exports = Character;
