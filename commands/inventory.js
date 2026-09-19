module.exports = [{
  pattern: "get/take <item@location>",
  priority: 3,
  action(item) {
    if (this.character.inventory.items.length >= this.character.inventory.capacity) {
      return this.message("Inventory Filled");
    }

    item.move(this.character.inventory);
    this.character.location.broadcast("Item Taken", { actor: this.character, item});
  }
}, {
  pattern: "drop <item@inventory>",
  priority: 3,
  action(item) {
    item.move(this.character.location);
    this.character.location.broadcast("Item Dropped", { actor: this.character, item});
  }
}, {
  pattern: "inventory",
  priority: 3,
  action() {
    this.message("Inventory", { inventory: this.character.inventory });
  }
}, {
  pattern: "give <item@inventory> (to) <character@location>",
  priority: 4,
  action(item, target) {
    if (!item || typeof item.move != "function" || item.location != this.character.inventory ||
        !this.character.inventory.items.includes(item)) {
      this.message("Unkown Item");
      return false;
    }

    if (!this.character.location || !target || !target.inventory || !Array.isArray(target.inventory.items) ||
        target.location != this.character.location || !this.character.location.characters.includes(target)) {
      this.message("Unkown Character");
      return false;
    }

    if (target.inventory.items.length >= target.inventory.capacity) {
      this.message("Receiver's Hands Full", {target});
      return false;
    }

    item.move(target.inventory);
    this.character.location.broadcast("Item Given", {actor: this.character, target, item});
    return true;
  }
}];
