module.exports = [{
  pattern: "take <string>",
  action(itemName) {
    let item = this.character.location.items.find((item) => (
      item.keywords.some((keyword) => keyword.startsWith(itemName))
    ));

    if (item) {
      if (this.character.inventory.items.length < this.character.inventory.capacity) {
        item.move(this.character.inventory);
        this.message("Item Taken", item);
      } else {
        this.message("Inventory Filled");
      }
    } else {
      this.message("Unkown Item");
    }
  }
}, {
  pattern: "inventory",
  action() {
    this.message("Inventory", this.character.inventory);
  }
}, {
  pattern: "drop <string>",
  action(itemName) {
    let item = this.character.inventory.items.find((item) => (
      item.keywords.some((keyword) => keyword.startsWith(itemName))
    ));

    if (item) {
      item.move(this.character.location);
      this.message("Item Dropped", item);
    } else {
      this.message("Unkown Item");
    }
  }
}];
