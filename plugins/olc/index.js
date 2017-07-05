const Room = require("../../src/room");

module.exports = function onlineCreatorPlugin({User}) {
  User.use("command:go:beforeInterpret", function(direction) {
    if (this.flags.has("mole mode") && !this.character.location.exits.some((exit) => exit.direction == direction)) {
      let room = new Room({
        name: {en: "A dummy room", ru: "Комната-шаблон"},
        surface: "ground"
      });

      room.register();

      this.character.location.link(direction, room);
    }
  });
}
