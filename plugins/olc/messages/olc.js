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
}];
