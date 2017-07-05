module.exports = [{
  pattern: "mole",
  priority: 20,
  action() {
    if (this.flags.has("mole mode")) {
      this.message("Leaving Mole Mode");
      this.flags.delete("mole mode");
    } else {
      this.message("Entering Mole Mode");
      this.flags.add("mole mode");
    }
  }
}];
