module.exports = [{
  name: "Door Is Closed",
  perform() {
    this.xterm.writeln({
      en: "The passage is closed.",
      ru: "Проход закрыт."
    });
  }
}, ]
