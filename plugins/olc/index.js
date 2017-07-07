module.exports = function onlineCreatorPlugin({User, Room, game}) {
  User.registerHook("command:go:beforeInterpret", function(direction) {
    if (this.flags.has("mole mode") && !this.character.location.exits.some((exit) => exit.direction == direction)) {
      let {x, y, z} = Room.calculateCoordinates(this.character.location, direction);
      let existingDestinationCell = game.world.map.find((cell) => cell.x == x && cell.y == y && cell.z == z);

      if (existingDestinationCell) {
        this.character.location.link(direction, existingDestinationCell.room);
      } else {
        let room = new Room({
          name: {en: "A dummy room", ru: "Комната-шаблон"},
          surface: "ground"
        });

        room.register();
        this.character.location.link(direction, room);
      }
    }
  });
}
