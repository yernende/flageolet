module.exports = [{
  name: "New Room",
  perform() {
    this.xterm.writeln("═".repeat(80));
  }
}, {
  name: "Room Description",
  perform(room) {
    // Room name
    this.xterm.tab();
    this.xterm.style({foreground: 15, bold: true});
    this.xterm.writeln(room.name);
    this.xterm.reset();

    // Room description
    this.xterm.tab();
    this.xterm.writeln("Lorem ipsum dolor sit amet, consectetur adipisicing");
    this.xterm.writeln("sed do eiusmod tempor incididunt ut labore et dolore");
    this.xterm.writeln("aliqua. Ut enim ad minim veniam, quis nostrud ullamco");
    this.xterm.writeln("laboris nisi ut aliquip ex ea commodo consequat.");
    this.xterm.writeln();

    // Exits
    let directions = room.getDirections();

    if (directions.length > 0) {
      this.xterm.tab();

      this.xterm.write({
        en: "Exits: ",
        ru: "Выходы: "
      });

      directions.forEach((exit, index) => {
        this.xterm.style({foreground: 45});
        this.xterm.write(exit);
        this.xterm.reset();

        if (index != directions.length - 1) {
          this.xterm.write(", ");
        }
      });

      this.xterm.writeln(".");
    } else {
      this.xterm.tab();

      this.xterm.write({
        en: "No exits.",
        ru: "Нет выходов."
      });
    }

    // Members of the room
    let members = [
      ...room.items,
      ...room.characters.filter((character) => character != this.character)
    ];

    if (members.length > 0) {
      this.xterm.writeln();

      for (let member of members) {
        this.xterm.tab();
        this.xterm.write("• ");
        this.xterm.style({foreground: member.color, bold: true});
        this.xterm.write(member.name);
        this.xterm.reset();
        this.xterm.writeln();
      }
    }

    this.xterm.writeln();
  }
}, {
  name: "Unkown Direction",
  perform() {
    this.xterm.writeln({
      en: "Unknown direction.",
      ru: "Неизвестное направление."
    });
  }
}, {
  name: "Character Arrived",
  perform(character) {
    this.xterm.writeName(character.name);
    this.xterm.writeName({
      en: " has arrived.",
      ru: " появился."
    });
  }
}, {
  name: "Room List",
  perform(rooms) {
    this.xterm.writeln({
      en: "There are rooms in the world:",
      ru: "В мире есть следующие комнаты:"
    });

    this.xterm.writeln();

    for (let [id, room] of rooms) {
      this.xterm.write(`[${room.id}] `);
      this.xterm.style({foreground: 15, bold: true});
      this.xterm.write(room.name)
      this.xterm.reset();
      this.xterm.writeln();
    }
  }
}, {
  name: "Unknown Room Id",
  perform() {
    this.xterm.writeln({
      en: "There is no such room in the world.",
      ru: "Такой комнаты не существует"
    });
  }
}];
