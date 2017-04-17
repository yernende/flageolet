module.exports = [{
  name: "Unkown Command",
  perform() {
    this.xterm.writeln("Unkown command.");
  }
}, {
  name: "Prompt",
  perform() {
    this.xterm.write("> ");
  }
}, {
  name: "Language Switched",
  perform() {
    this.xterm.writeln({
      en: "The language switched to English.",
      ru: "Язык игры переключён на русский."
    });
  }
}, {
  name: "Wrong Syntax",
  perform() {
    this.xterm.writeln({
      en: "The command's argument are typed wrong.",
      ru: "Неправильно указаны аргументы команды."
    });
  }
}];
