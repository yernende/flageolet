const game = require("../src/game");

module.exports = [{
  pattern: "take <item@location>",
  priority: 3,
  action(item) {
    if (this.character.inventory.items.length < this.character.inventory.capacity) {
      item.move(this.character.inventory);
      this.character.location.broadcast("Item Taken", this.character, item);
    } else {
      this.message("Inventory Filled");
    }
  }
}, {
  pattern: "drop <item@inventory>",
  priority: 3,
  action(item) {
    item.move(this.character.location);
    this.character.location.broadcast("Item Dropped", this.character, item);
  }
}, {
  pattern: "give <item@inventory> <character@location>",
  priority: 3,
  action(item, target) {
    if (target.inventory.items.length < target.inventory.capacity) {
      item.move(target.inventory);
      this.character.location.broadcast("Item Given", this.character, target, item);
    } else {
      this.message("Receiver's Hands Full", target);
    }
  }
}, {
  pattern: "inventory",
  priority: 3,
  action() {
    this.message("Inventory", this.character.inventory);
  }
}, {
  pattern: "who",
  action() {
    this.message("Users List", game.users);
  }
}, {
  pattern: "talk <character>",
  action(target) {
    if (target.isNPC) {
      target.owner.message("Talk", this.character);
    }
  }
}];
