module.exports = [{
  name: "Entering Mole Mode",
  perform() {
    this.xterm.writeln({
      en: "Mole mode enabled.",
      ru: "Режим крота включён."
    });
  }
}, {
  name: "Leaving Mole Mode",
  perform() {
    this.xterm.writeln({
      en: "Mole mode disabled.",
      ru: "Режим крота выключен."
    });
  }
}, {
  name: "Expect Room Name English",
  perform() {
    this.xterm.writeln({
      en: "Enter the room name (English):",
      ru: "Введите название комнаты (en):"
    });
  }
}, {
  name: "Expect Room Name Russian",
  perform() {
    this.xterm.writeln({
      en: "Enter the room name (Russian):",
      ru: "Введите название комнаты (ru):"
    });
  }
}, {
  name: "Expect Room Surface",
  perform() {
    this.xterm.writeln({
      en: "Enter the room surface:",
      ru: "Введите поверхность комнаты:"
    });
  }
}, {
  name: "World Being Saved",
  perform() {
    this.xterm.writeln({
      en: "Saving the world...",
      ru: "Сохранение мира..."
    });
  }
}, {
  name: "World Saved",
  perform() {
    this.xterm.writeln({
      en: "The world has been saved.",
      ru: "Мир сохранён."
    });
  }
}, {
  name: "World Save Failed",
  perform() {
    this.xterm.writeln({
      en: "The world could not be saved. Check the server log.",
      ru: "Не удалось сохранить мир. Проверьте журнал сервера."
    });
  }
}, {
  name: "Room Protected",
  perform() {
    this.xterm.writeln({
      en: "This room is protected: it contains a spawn point, an NPC, or a door.",
      ru: "Комната защищена: здесь точка появления, персонаж или дверь."
    });
  }
}, {
  name: "Room Deleted",
  perform() {
    this.xterm.writeln({
      en: "The room has been deleted.",
      ru: "Комната удалена."
    });
  }
}];
