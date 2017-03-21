const CSI = "\u001B[";
const RESET_STYLE = CSI + "m";
const TAB = "  ";

module.exports = class Xterm {
  constructor(user) {
    this.user = user;
    this.writeIntoBoxContent = false;
    this.writeIntoBoxHeader = false;
    this.newLine = true;
    this.styleSetter = CSI + "m";
  }

  write(string = "") {
    if (this.newLine) {
      if (this.writeIntoBoxHeader) {
        this.user.output.push(RESET_STYLE + "┃");
        this.user.output.push(TAB);
      } else if (this.writeIntoBoxContent) {
        this.user.output.push(RESET_STYLE + "│");
        this.user.output.push(TAB);
      }

      this.newLine = false;
    }

    this.user.output.push(this.styleSetter + string);
  }

  endln() {
    if (this.writeIntoBoxHeader) {
      this.user.output.push(CSI + "80G"); // Move cursor to 80 column
      this.user.output.push(RESET_STYLE);
      this.user.output.push("┃");
    } else if (this.writeIntoBoxContent) {
      this.user.output.push(CSI + "80G"); // Move cursor to 80 column
      this.user.output.push(RESET_STYLE);
      this.user.output.push("│");
    }

    this.user.output.push("\n");
    this.newLine = true;
  }

  writeln(string = "") {
    this.write(string);
    this.endln();
  }

  writeName(name) {
    if (name.length > 0) {
      this.write(name[0].toUpperCase() + name.slice(1));
    }
  }

  tab() {
    this.write(TAB);
  }

  style({foreground, background, bold = false, underline = false}) {
    let modificators = [];

    if (foreground) {
      modificators.push("38;5;" + foreground);
    }

    if (background) {
      modificators.push("48;5;" + background);
    }

    if (bold) {
      modificators.push("1");
    }

    if (underline) {
      modificators.push("4");
    }

    this.styleSetter = CSI + modificators.join(";") + "m";
  }

  reset() {
    this.styleSetter = RESET_STYLE;
  }

  writeText(message) {
    message.split("\n").forEach((line, i, lines) => {
      line = line.trim();
      if (line.length == 0 && (i == 0 || i == lines.length - 1)) return;
      this.writeln(line);
    });
  }

  startBoxHeader() {
    this.user.output.push("┏" + "━".repeat(78) + "┓\n");
    this.writeIntoBoxHeader = true;
  }

  startBoxContent() {
    if (this.writeIntoBoxHeader) {
      this.user.output.push("┡" + "━".repeat(78) + "┩\n");
      this.writeIntoBoxHeader = false;
    } else {
      this.user.output.push("┌" + "─".repeat(78) + "┐\n")
    }

    this.writeIntoBoxContent = true;
  }

  endBox() {
    this.user.output.push("└" + "─".repeat(78) + "┘\n");
    this.writeIntoBoxContent = false;
  }
}
