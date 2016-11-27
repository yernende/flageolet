class CommandArgument extends RegExp {
  constructor(pattern) {
    let patterns = [];
    let parameters = [];

    let nodes = pattern.match(/<.+?>|\(\w+\)|\w+|\s+/g);

    if (nodes) {
      for (let node of nodes) {
        if (/<.+?>/.test(node)) {
          let [, type, filter] = /<(.+?)(?::(.+?))?>/.exec(node);

          let stringPattern = String.raw `(\S+|'.+?'|".+?")`;
          let numberPattern = String.raw `(\d+?)`;

          switch (type) {
            case "string":
              parameters.push("string");
              patterns.push(filter || stringPattern);
              break;

            case "number":
              parameters.push("number");
              patterns.push(numberPattern);
              break;
          }
        } else if (/\(\w+\)/.test(node)) {
          let [, word] = /\((\w+)\)/.exec(node);
          patterns.push(String.raw `(?:${word})?`);
        } else if (/\w+/.test(node)) {
          patterns.push(node);
        } else if (/\s+/.test(node)) {
          patterns.push(String.raw `\s+`);
        }
      }
    }

    super(`^${patterns.join("")}$`);

    this.parameters = parameters;
  }

  exec(argument) {
    let executionResult = super.exec(argument);

    if (executionResult === null) {
      return null;
    } else {
      return executionResult.splice(1).map((parameter, index) => {
        parameter = stripSurroundingQuotes(parameter);
        let type = this.parameters[index];

        switch (type) {
          case "string":
            return parameter;

          case "number":
            return Number(parameter);
        }
      });
    }
  }
}

class Command {
  constructor({pattern, action}) {
    let [, base, argument] = /(\S+)(?:\s+(.+))?/.exec(pattern);

    this.base = base;
    this.action = action;

    if (argument) {
      this.argument = new CommandArgument(argument);
    }
  }
}

function stripSurroundingQuotes(string) {
  if (
    (string.startsWith("'") && string.endsWith("'"))
    || string.startsWith("\"") && string.endsWith("\"")
  ) {
    string = string.slice(1, -1);
  }

  return string;
}

module.exports = Command;
