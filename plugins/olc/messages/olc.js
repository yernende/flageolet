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
}];
