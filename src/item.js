const game = require("./game");

class Item {
  constructor({name, color, keywords}) {
    this.name = name;
    this.color = color;
    this.id = Item.idCounter++;


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
