class CommandArgument extends RegExp {
  constructor(pattern) {
    let patterns = [];
    let parameters = [];
    let locations = [];

    let nodes = pattern.match(/<.+?>|\(\w+\)|\w+|\s+/g);

    if (nodes) {
      for (let node of nodes) {
        if (/<.+?>/.test(node)) {
          let [, type, filter, location] = /<(.+?)(?::(.+?))?(?:@(.+?))?>/.exec(node);

          let stringPattern = String.raw `(\S+|'.+?'|".+?")`;
          let numberPattern = String.raw `(\d+?)`;

          if (location) {
            locations.push(location);
          }

          switch (type) {
            case "string":
              parameters.push("string");
              patterns.push(filter || stringPattern);
              break;

            case "number":
              parameters.push("number");
              patterns.push(numberPattern);
              break;

            case "item":
              parameters.push("item");
              patterns.push(stringPattern);
              break;

            case "character":
              parameters.push("character");
              patterns.push(stringPattern);
              break;

            case "exit":
              parameters.push("exit");
              patterns.push(stringPattern);
              break;

            default:
              throw new Error(`Unkown parameter type: ${type}.`);
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
    this.locations = locations;
  }

  exec(argument, user) {
    let executionResult = super.exec(argument);

    if (executionResult === null) {
      user.message("Wrong Syntax");
      return null;
    } else {
      let isExecutionErrored = false;

      let mappedExecutionResult = executionResult.splice(1).map((parameter, index) => {
        parameter = stripSurroundingQuotes(parameter);
        let type = this.parameters[index];
        let location = this.locations[index];
        let scope = [];
        let item, character, exit;

        switch (type) {
          case "string":
            return parameter;

          case "number":
            return Number(parameter);

          case "item":
            if (location.includes("location")) {
              scope.push(...user.character.location.items);
            }

            if (location.includes("inventory")) {
              scope.push(...user.character.inventory.items);
            }

            item = scope.find(
              (item) => item.keywords.some((keyword) => keyword.startsWith(parameter))
            );

            if (item) {
              return item;
            } else {
              user.message("Unkown Item");
              isExecutionErrored = true;
              return;
            }

          case "character":
            if (location == undefined || location.includes("location")) {
              scope.push(...user.character.location.characters);
            }

            character = scope.find(
              (character) => character.keywords.some((keyword) => keyword.startsWith(parameter))
            );

            if (character) {
              return character;
            } else {
              user.message("Unkown Character");
              isExecutionErrored = true;
              return;
            }

          case "exit":
            exit = user.character.location.exits.find((exit) => exit.direction.startsWith(parameter));

            if (exit) {
              return exit;
            } else {
              user.message("Unkown Exit");
              isExecutionErrored = true;
              return;
            }
        }
      });

      if (isExecutionErrored) {
        return null;
      } else {
        return mappedExecutionResult;
      }
    }
  }
}

class Command {
  constructor({pattern, action, priority = 10}) {
    let [, base, argument] = /(\S+)(?:\s+(.+))?/.exec(pattern);

    this.base = base;
    this.action = action;
    this.priority = priority;

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
