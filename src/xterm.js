const Character = require("./character");
const Item = require("./item");
const Room = require("./room");

const CSI = "\u001B[";
const RESET_STYLE = CSI + "m";
const NEWLINE = "\n\r";
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
    this.variables = new Map();
  }

  translate(data) {
    if (typeof data == "object") {
      return data[this.user.language];
    } else {
      return data;
    }
  }

  capitalize(string) {
    return string[0].toUpperCase() + string.substr(1);
  }

  writeRaw(string) {
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

  write(data, variables) {
    data = this.translate(data);

    if (!data || data.length == 0) {
      this.writeRaw("");
      return;
    };

    if (data.length == 1 || !data.includes("$")) {
      this.writeRaw(data);
      return;
    }

    for (let part of data.match(/\$(\w+)|[^$]+/g)) {
      if (part[0] == "$") {
        let variable;
        if (variables) variable = variables[part.substr(1)];
        if (!variable) variable = this.variables.get(part.substr(1))

        this.writeModel(variable);
      } else {
        this.writeRaw(part);
      }
    }
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

    this.user.output.push(NEWLINE);
    this.newLine = true;
    this.user.messageLinesCount++;
  }

  writeln(data, variables) {
    this.write(data, variables);
    this.endln();
  }

  writeModel(model) {
    if (model instanceof Character) {
      this.writeCharacter(model);
    } else if (model instanceof Item) {
      this.writeItem(model);
    } else if (model instanceof Room.Door) {
      this.writeDoor(model);
    }
  }

  writeDoor(door) {
    if (door) {
      let name = this.translate(door.name);
      if (this.newLine) name = this.capitalize(name);

      this.writeRaw(name);
    } else {
      this.writeRaw({
        en: "Something",
        ru: "Что-то"
      });
    }
  }

  writeCharacter(character) {
    if (character) {
      let name = this.translate(character.name);
      if (this.newLine) name = this.capitalize(name);

      this.style({foreground: character.color, bold: true});
      this.writeRaw(name);
      this.reset();
    } else {
      this.writeRaw({
        en: "Someone",
        ru: "Кто-то"
      });
    }
  }

  writeItem(item) {
    if (item) {
      let name = this.translate(item.name);
      if (this.newLine) name = this.capitalize(name);

      this.style({foreground: item.color, bold: true});
      this.writeRaw(name);
      this.reset();
    } else {
      this.writeRaw({
        en: "Something",
        ru: "Что-то"
      });
    }
  }

  writeListMark() {
    this.tab();
    this.writeRaw("• ");
  }

  tab() {
    this.writeRaw(TAB);
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

  writeText(text) {
    text = this.translate(text);

    if (text) {
      text.split("\n").forEach((line, i, lines) => {
        line = line.trim();
        if (line.length == 0 && (i == 0 || i == lines.length - 1)) return;
        this.writeRaw(line);
        this.endln();
      });
    }
  }

  startBoxHeader({width = DEFAULT_BOX_WIDTH, padding = 2, left, top} = {}) {
    this.newLine = true
    this.writeIntoBoxHeader = true;
    this.boxWidth = width;
    this.paddingWidth = padding;
    this.left = left;
    this.top = top;

    this.top && this.user.output.push(CSI + (this.user.messageLinesCount - this.top + 1) + "F");
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");
    this.user.output.push("┏" + "━".repeat(78) + "┓" + NEWLINE);
  }

  startBoxContent({width = DEFAULT_BOX_WIDTH, padding = 2, left, top} = {}) {
    this.newLine = true;
    this.writeIntoBoxContent = true;
    this.boxWidth = width;
    this.paddingWidth = padding;
    this.left = left;
    this.top = top;

    this.top && this.user.output.push(CSI + (this.user.messageLinesCount - this.top + 1) + "F");
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");

    if (this.writeIntoBoxHeader) {
      this.user.output.push("┡" + "━".repeat(this.boxWidth - 2) + "┩" + NEWLINE);
      this.writeIntoBoxHeader = false;
    } else {
      this.user.output.push("┌" + "─".repeat(this.boxWidth - 2) + "┐" + NEWLINE)
    }
  }

  endBox() {
    this.left && this.user.output.push(CSI + (this.left + 1) + "G");
    this.user.output.push("└" + "─".repeat(this.boxWidth - 2) + "┘" + NEWLINE);
    this.writeIntoBoxContent = false;
    this.boxWidth = null;
    this.paddingWidth = null;
    this.left = null;
    this.top = null;
  }

  register(variables) {
    for (let [key, value] of Object.entries(variables)) {
      this.variables.set(key, value);
    }
  }
}
