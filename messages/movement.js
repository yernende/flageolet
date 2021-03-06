module.exports = [{
  name: "New Room",
  perform() {
    this.xterm.writeln("═".repeat(80));
  }
}, {
  name: "Room Description",
  perform({room}) {
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

      room.exits.forEach((exit, index) => {
        this.xterm.style({foreground: 45});
        this.xterm.write(exit.direction);

        if (exit.door && exit.door.closed) {
          this.xterm.write({
            en: " (closed)",
            ru: " (закрыто)"
          });
        }

        this.xterm.reset();

        if (index != room.exits.length - 1) {
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
        this.xterm.writeListMark();
        this.xterm.writeModel(member, true);
        this.xterm.writeln();
      }
    }

    this.xterm.writeln();

    this.xterm.startBoxContent({left: 59, top: 1, width: 21, padding: 1});
    drawMap.call(this, room);
    this.xterm.endBox();
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
  perform({character}) {
    this.xterm.writeln({
      en: "$character has arrived.",
      ru: "$character появился."
    });
  }
}, {
  name: "Character Left",
  perform({character, direction}) {
    this.xterm.writeCharacter(character);

    this.xterm.writeln((() => {
      switch (direction) {
        case "north": return {"en": " leaves north.", "ru": " удаляется на север."};
        case "south": return {"en": " leaves south.", "ru": " удаляется на юг."};
        case "west": return {"en": " leaves west.", "ru": " удаляется на запад."};
        case "east": return {"en": " leaves east.", "ru": " удаляется на восток."};
        case "up": return {"en": " leaves up.", "ru": " удаляется вверх."};
        case "down": return {"en": " leaves down.", "ru": " удаляется вниз."};
      }
    })());
  }
}, {
  name: "Room List",
  perform({rooms}) {
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
}, {
  name: "Character Entered Game",
  perform({character}) {
    this.xterm.writeln({
      en: "$character has entered the game.",
      ru: "$character вошёл в игру."
    });
  }
}, {
  name: "Character Left Game",
  perform({character}) {
    this.xterm.writeln({
      en: "$character leaves the game.",
      ru: "$character покидает игру."
    });
  }
}, {
  name: "Can't Swim",
  perform() {
    this.xterm.writeln({
      en: "You can not swim.",
      ru: "Ты не умеешь плавать."
    });
  }
}, {
  name: "Unkown Exit",
  perform() {
    this.xterm.writeln({
      en: "There is no such exit.",
      ru: "Здесь нет такого выхода."
    });
  }
}];

function drawMap(centerRoom) {
  let walk = walkPathFrom.bind(null, centerRoom);

  let rooms = [
    [null, null, walk("north north"), null, null],
    [null, walk("north west"), walk("north"), walk("north east"), null],
    [walk("west west"), walk("west"), walk() , walk("east"), walk("east east")],
    [null, walk("south west"), walk("south"), walk("south east"), null],
    [null, null, walk("south south"), null, null]
  ];

  let map = Array(9).fill().map(() => Array(9));;

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      let room = rooms[y][x];
      let neighborNorth = y == 0 ? null : rooms[y - 1][x];
      let neighborSouth = y == 4 ? null : rooms[y + 1][x];
      let neighborWest = x == 0 ? null : rooms[y][x - 1];
      let neighborEast = x == 4 ? null : rooms[y][x + 1];


      if (room) {
        let cell = {};

        if (room == centerRoom) {
          cell.symbol = "@";
          cell.color = 220;
        } else {
          cell.symbol = "■";
          cell.color = getRoomColor(room);
        }

        map[y * 2][x * 2] = cell;
      } else {
        continue;
      }

      if (neighborNorth && room.exits.some((exit) => exit.direction == "north")) {
        let cell = {type: "arrow"};

        if (neighborNorth.south == room) {
          cell.symbol = "↕";
        } else {
          cell.symbol = "↑";
        }

        map[y * 2 - 1][x * 2] = cell;
      }

      if (neighborSouth && room.exits.some((exit) => exit.direction == "south")) {
        let cell = {type: "arrow"};

        if (neighborSouth.north == room) {
          cell.symbol = "↕";
        } else {
          cell.symbol = "↓";
        }

        map[y * 2 + 1][x * 2] = cell;
      }

      if (neighborWest && room.exits.some((exit) => exit.direction == "west")) {
        let cell = {type: "arrow"};

        if (neighborWest.east == room) {
          cell.symbol = "↔";
        } else {
          cell.symbol = "←";
        }

        map[y * 2][x * 2 - 1] = cell;
      }

      if (neighborEast && room.exits.some((exit) => exit.direction == "east")) {
        let cell = {type: "arrow"};

        if (neighborEast.west == room) {
          cell.symbol = "↔";
        } else {
          cell.symbol = "→";
        }

        map[y * 2][x * 2 + 1] = cell;
      }
    }
  }

  for (let y = 0; y < 9; y++ ) {
    for (let x = 0; x < 9; x++) {
      let cell = map[y][x];

      if (cell) {
        if (cell.type == "arrow") this.xterm.style({foreground: 244, bold: true});
        if (cell.color) this.xterm.style({foreground: cell.color});
        this.xterm.write(cell.symbol);
        if (cell.color || cell.type == "arrow") this.xterm.reset();
      } else {
        this.xterm.write(" ");
      }

      this.xterm.write(" ");
    }

    this.xterm.writeln();
  }
}

function getRoomColor(room) {
  switch (room.surface) {
    case "water": return 12;
    case "ground": return 94;
    case "grass": return 28;
    case "wood": return 52;
    case "marble": return 195;
  }
}

function walkPathFrom(initialPoint, path) {
  if (!path) return initialPoint;

  let walkThroughDirections = (directions) => {
    let location = initialPoint;

    for (let direction of directions) {
      let exit = location.exits.find((exit) => exit.direction == direction);

      if (exit && (exit.door ? !exit.door.closed : true)) {
        location = exit.destination;
      } else {
        return null;
      }
    }

    return location;
  };

  let directions = path.split(" ");
  return walkThroughDirections(directions) || walkThroughDirections(directions.reverse());
}
