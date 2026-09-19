module.exports = [{
  name: "Unkown Command",
  perform() {
    this.xterm.writeln("Unknown command.");
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
      en: "Language switched to English.",
      ru: "Язык игры переключён на русский."
    });
  }
}, {
  name: "Wrong Syntax",
  perform() {
    this.xterm.writeln({
      en: "Invalid command arguments.",
      ru: "Неправильно указаны аргументы команды."
    });
  }
}, {
  name: "Commands List",
  perform({commands}) {
    this.xterm.writeln({
      en: "Available commands:",
      ru: "Список доступных команд:"
    });

    for (let command of commands) {
      this.xterm.tab();
      this.xterm.write("• ");
      this.xterm.writeln(command.pattern);
    }
  }
}, {
  name: "Command Needs Argument",
  perform() {
    this.xterm.writeln({
      en: "This command requires an argument.",
      ru: "Необходимо указать аргумент для команды."
    });
  }
}];
