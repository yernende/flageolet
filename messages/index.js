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
}, {
  name: "Commands List",
  perform(commands) {
    this.xterm.writeln({
      en: "There are commands available:",
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
      en: "You need to specify argument for the command.",
      ru: "Необходимо указать аргумент для команды."
    });
  }
}];
