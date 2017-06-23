module.exports = [{
  pattern: "get/take <item@location>",
  priority: 3,
  action(item) {
    if (this.character.inventory.items.length >= this.character.inventory.capacity) {
      return this.message("Inventory Filled");
    }

    item.move(this.character.inventory);
    this.character.location.broadcast("Item Taken", this.character, item);
  }
}, {
  pattern: "drop <item@inventory>",
  priority: 3,
  action(item) {
    item.move(this.character.location);
    this.character.location.broadcast("Item Dropped", this.character, item);
  }
}, {
  pattern: "inventory",
  priority: 3,
  action() {
    this.message("Inventory", this.character.inventory);
  }
}, {
  pattern: "give <item@inventory> <character@location>",
  priority: 4,
  action(item, target) {
    if (target.inventory.items.length >= target.inventory.capacity) {
      return  this.message("Receiver's Hands Full", target);
    }

    item.move(target.inventory);
    this.character.location.broadcast("Item Given", this.character, target, item);
  }
}];
