module.exports = [{
  name: "Entering Mole Mode",
  perform() {
    this.xterm.writeln({
      en: "Entering MOLE mode. Arrrgh!",
      ru: "Активиция режима КРОТ. Ррррр!"
    });
  }
}, {
  name: "Leaving Mole Mode",
  perform() {
    this.xterm.writeln({
      en: "Leaving mole mode.",
      ru: "Деактивация режима крота."
    });
  }
}, {
  name: "Expect Room Name English",
  perform() {
    this.xterm.writeln({
      en: "Type room name (en)",
      ru: "Введите имя комнаты (en)"
    });
  }
}, {
  name: "Expect Room Name Russian",
  perform() {
    this.xterm.writeln({
      en: "Type room name (ru)",
      ru: "Введите имя комнаты (ru)"
    });
  }
}, {
  name: "Expect Room Surface",
  perform() {
    this.xterm.writeln({
      en: "Type room surface",
      ru: "Введите поверхность комнаты"
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
  name: "Room Deleted",
  perform() {
    this.xterm.writeln({
      en: "The room has been deleted.",
      ru: "Комната удалена"
    });
  }
}];
