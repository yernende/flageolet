const saveWorld = require("../save.js");

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
    let targetRoom = id == null ? this.character.location : this.character.location.area.rooms.get(id);
    if (!targetRoom) return this.message("Unknown Room Id");

    this.message("Expect Room Name English");
    let nameEnglish = await this.catchQuery();

    this.message("Expect Room Name Russian");
    let nameRussian = await this.catchQuery();

    this.message("Expect Room Surface");
    let surface = await this.catchQuery();

    if (nameEnglish) targetRoom.name.en = nameEnglish;
    if (nameRussian) targetRoom.name.ru = nameRussian;
    if (surface) targetRoom.surface = surface;

    this.execute("look");
  }
}, {
  pattern: "delete room <number?>",
  priority: 20,
  action(id) {
    let targetRoom = id == null ? this.character.location : this.character.location.area.rooms.get(id);
    if (!targetRoom) return this.message("Unknown Room Id");
    if (!targetRoom.destroy()) return this.message("Room Protected");
    this.message("Room Deleted");
  }
}, {
  pattern: "save world",
  priority: 20,
  async action() {
    this.message("World Being Saved");
    try {
      await saveWorld();
      this.message("World Saved");
    } catch (error) {
      console.error("Could not save world:", error);
      this.message("World Save Failed");
    }
  }
}];
