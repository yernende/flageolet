const CSI = "\u001B[";

module.exports = class Xterm {
  constructor(user) {
    this.user = user;
  }

  writeln(string) {
    this.user.output.push(string + "\n");
  }

  tab() {
    this.user.output.push("  ");
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

    this.user.output.push(CSI + modificators.join(";") + "m");
  }

  reset() {
    this.user.output.push(CSI + "m");
  }
}
