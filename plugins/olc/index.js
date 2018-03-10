module.exports = function onlineCreatorPlugin({User, Room, game}) {
  User.registerHook("command:go:beforeInterpret", function(direction) {
    if (this.flags.has("mole mode") && !this.character.location.exits.some((exit) => exit.direction == direction)) {
      let {x, y, z} = Room.calculateCoordinates(this.character.location, direction);
      let existingDestinationCell = this.character.location.area.map.find(
        (cell) => cell.x == x && cell.y == y && cell.z == z
      );

      if (existingDestinationCell) {
        this.character.location.link(direction, existingDestinationCell.room);
      } else {
        let room = new Room({
          name: {en: "A dummy room", ru: "Комната-шаблон"},
          surface: "ground",
          area: this.character.location.area
        });

        room.register(this.character.location.area, ++this.character.location.area.largestRoomId);
        this.character.location.link(direction, room);
      }
    }
  });
}
