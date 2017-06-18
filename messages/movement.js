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
  name: "Door Is Closed",
  perform() {
    this.xterm.writeln({
      en: "The passage is closed.",
      ru: "Проход закрыт."
    });
  }
}, {
  name: "Character Arrived",
  perform(character) {
    this.xterm.writeName(character.name);
    this.xterm.writeln({
      en: " has arrived.",
      ru: " появился."
    });
  }
}, {
  name: "Character Left",
  perform(character, direction) {
    this.xterm.writeName(character.name);

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
}, {
  name: "Character Entered Game",
  perform(character) {
    this.xterm.writeName(character.name);

    this.xterm.writeln({
      en: " has entered the game.",
      ru: " вошёл в игру."
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
  name: "No Door",
  perform() {
    this.xterm.writeln({
      en: "There is no door.",
      ru: "Там нет двери."
    });
  }
}, {
  name: "Door Already Opened",
  perform() {
    this.xterm.writeln({
      en: "That door is already opened.",
      ru: "Эта дверь уже открыта."
    });
  }
}, {
  name: "Door Opened",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You open ",
        ru: "Ты открываешь "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " opens ",
        ru: " открывает "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Door Already Closed",
  perform() {
    this.xterm.writeln({
      en: "That door is already closed.",
      ru: "Эта дверь уже закрыта."
    });
  }
}, {
  name: "Door Closed",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You close ",
        ru: "Ты закрываешь "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " closes ",
        ru: " закрывает "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "No Key",
  perform(door) {
    this.xterm.write({
      en: "No key to open ",
      ru: "У тебя нет ключа, чтобы открыть "
    });

    this.xterm.write(door.name);
    this.xterm.writeln(".");
  }
}, {
  name: "Door Already Unlocked",
  perform() {
    this.xterm.writeln({
      en: "That door is already unlocked.",
      ru: "Эта дверь уже отперта."
    });
  }
}, {
  name: "Door Unlocked",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You unlock ",
        ru: "Ты отпираешь "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " unlocks ",
        ru: " отпирает "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
  }
}, {
  name: "Door Already Locked",
  perform() {
    this.xterm.writeln({
      en: "That door is already locked.",
      ru: "Эта дверь уже заперта."
    });
  }
}, {
  name: "Door Locked",
  perform(actor, door) {
    if (actor == this.character) {
      this.xterm.write({
        en: "You lock ",
        ru: "Ты запираешь "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    } else {
      this.xterm.writeName(actor.name);
      this.xterm.write({
        en: " locks ",
        ru: " запирает "
      });
      this.xterm.write(door.name);
      this.xterm.writeln(".");
    }
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
