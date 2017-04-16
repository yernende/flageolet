module.exports = [{
  pattern: "take <item@location>",
  action(item) {
    if (this.character.inventory.items.length < this.character.inventory.capacity) {
      item.move(this.character.inventory);
      this.message("Item Taken", item);
    } else {
      this.message("Inventory Filled");
    }
  }
}, {
  pattern: "drop <item@inventory>",
  action(item) {
    item.move(this.character.location);
    this.message("Item Dropped", item);
  }
}, {
  pattern: "inventory",
  action() {
    this.message("Inventory", this.character.inventory);
  }
}];
