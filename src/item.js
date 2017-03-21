const game = require("./game");

class Item {
  constructor({name, color, keywords = name.split(" ")}) {
    this.name = name;
    this.color = color;
    this.id = Item.idCounter++;
  }

  register() {
    game.world.items.set(this.id, this);
  }

  move(destination) {
    if (this.location) {
      this.location.items.splice(this.location.items.indexOf(this), 1);
    }

    destination.items.push(this);
    this.location = destination;
  }
}

Item.idCounter = 0;
module.exports = Item;
