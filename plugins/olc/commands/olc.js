const game = require("../../../src/game");

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
}, {
  pattern: "edit room <number?>",
  priority: 20,
  async action(id) {
    this.message("Expect Room Name English");
    let nameEnglish = await this.catchQuery();

    this.message("Expect Room Name Russian");
    let nameRussian = await this.catchQuery();

    this.message("Expect Room Surface");
    let surface = await this.catchQuery();

    let targetRoom = id ? this.character.location.area.rooms.get(id) : this.character.location;

    if (nameEnglish) targetRoom.name.en = nameEnglish;
    if (nameRussian) targetRoom.name.ru = nameRussian;
    if (surface) targetRoom.surface = surface;

    this.execute("look");
  }
}];
