module.exports = [{
  pattern: "open <exit>",
  priority: 2,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.closed) {
      this.message("Door Already Opened");
      return false;
    }

    if (exit.door.locked && !this.execute("unlock", exit)) {
      return false;
    }

    exit.door.closed = false;
    this.character.location.broadcast("Door Opened", this.character, exit.door);
    return true;
  }
}, {
  pattern: "close <exit>",
  priority: 2,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (exit.door.closed) {
      this.message("Door Already Closed");
      return false;
    }

    exit.door.closed = true;
    this.character.location.broadcast("Door Closed", this.character, exit.door);
    return true;
  }
}, {
  pattern: "unlock <exit>",
  priority: 2,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.locked) {
      this.message("Door Already Unlocked");
      return false;
    }

    if (this.character.inventory.items.some((item) => item.id == exit.door.keyId)) {
      this.character.location.broadcast("Door Unlocked", this.character, exit.door);
      exit.door.locked = false;
      return true;
    } else {
      this.message("No Key", exit.door);
      return false;
    }
  }
}, {
  pattern: "lock <exit>",
  priority: 2,
  action(exit) {
    if (!exit.door) {
      this.message("No Door");
      return false;
    }

    if (!exit.door.closed && !this.execute("close", exit)) {
      return false;
    }

    if (exit.door.locked) {
      this.message("Door Already Locked");
      return false;
    }

    if (this.character.inventory.items.some((item) => item.id == exit.door.keyId)) {
      this.character.location.broadcast("Door Locked", this.character, exit.door);
      exit.door.locked = true;
      return true;
    } else {
      this.message("No Key", exit.door);
      return false;
    }
  }
}];
