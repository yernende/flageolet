const CSI = "\u001B[";
const RESET_STYLE = CSI + "m";
const TAB = "  ";
const DEFAULT_BOX_WIDTH = 80;

module.exports = class Xterm {
  constructor(user) {
    this.user = user;
    this.writeIntoBoxContent = false;
    this.writeIntoBoxHeader = false;
    this.newLine = true;
    this.styleSetter = CSI + "m";
    this.boxWidth = null;
    this.paddingWidth = null;
    this.left = null;
    this.top = null;
  }

  write(string = "") {
    if (typeof string == "object") string = string[this.user.language];
    if (string == undefined) return;

    if (this.newLine) {
      if (this.writeIntoBoxHeader) {
        this.left && this.user.output.push(CSI + (this.left + 1) + "G");
        this.user.output.push(RESET_STYLE + "┃");
        this.user.output.push(" ".repeat(this.paddingWidth));
      } else if (this.writeIntoBoxContent) {
        this.left && this.user.output.push(CSI + (this.left + 1) + "G");
        this.user.output.push(RESET_STYLE + "│");
        this.user.output.push(" ".repeat(this.paddingWidth));
      }

      this.newLine = false;
    }

    this.user.output.push(this.styleSetter + string);
  }

  endln() {
    if (this.writeIntoBoxHeader) {
      this.user.output.push(CSI + ((this.left || 0) + this.boxWidth) + "G");
      this.user.output.push(RESET_STYLE);
      this.user.output.push("┃");
    } else if (this.writeIntoBoxContent) {
      this.user.output.push(CSI + ((this.left || 0) + this.boxWidth) + "G"); // Move cursor
      this.user.output.push(RESET_STYLE);
      this.user.output.push("│");
    }

    this.user.output.push("\n");
    this.newLine = true;
    this.user.messageLinesCount++;
  }

  writeln(string = "") {
    if (typeof string == "object") string = string[this.user.language];
    if (string == undefined) return;

    this.write(string);
    this.endln();
  }

  writeName(name = "") {
    if (typeof name == "object") name = name[this.user.language];
    if (name == undefined) return;

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

  writeText(text = "") {
    if (typeof text == "object") text = text[this.user.language];
    if (text == undefined) return;

    text.split("\n").forEach((line, i, lines) => {
      line = line.trim();
      if (line.length == 0 && (i == 0 || i == lines.length - 1)) return;
      this.writeln(line);
    });
  }

  startBoxHeader({width = DEFAULT_BOX_WIDTH, padding = 2, left, top} = {}) {
    this.boxWidth = width;
    this.paddingWidth = padding;
    this.writeIntoBoxHeader = true;
    this.left = left;
    this.top = top;

    this.top && this.user.output.push(CSI + (this.user.messageLinesCount - this.top + 1) + "F");
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");
    this.user.output.push("┏" + "━".repeat(78) + "┓\n");
  }

  startBoxContent({width = DEFAULT_BOX_WIDTH, padding = 2, left, top} = {}) {
    this.boxWidth = width;
    this.paddingWidth = padding;
    this.writeIntoBoxContent = true;
    this.left = left;
    this.top = top;

    this.top && this.user.output.push(CSI + (this.user.messageLinesCount - this.top + 1) + "F");
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");

    if (this.writeIntoBoxHeader) {
      this.user.output.push("┡" + "━".repeat(this.boxWidth - 2) + "┩\n");
      this.writeIntoBoxHeader = false;
    } else {
      this.user.output.push("┌" + "─".repeat(this.boxWidth - 2) + "┐\n")
    }
  }

  endBox() {
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");
    this.user.output.push("└" + "─".repeat(this.boxWidth - 2) + "┘\n");
    this.writeIntoBoxContent = false;
    this.boxWidth = null;
    this.paddingWidth = null;
    this.left = null;
    this.top = null;
  }
}
