let game = require("./game");

class CommandArgument extends RegExp {
  constructor(pattern) {
    let patterns = [];
    let parameters = [];

    let nodes = pattern.match(/<.+?>| \(|\)|[^<>()\s]+|\s+/g);

    if (nodes) {
      for (let node of nodes) {
        if (/<.+?>/.test(node)) {
          let [, type, isOptional, filter, location] = /<(.+?)(\?)?(?::(.+?))?(?:@(.+?))?>/.exec(node);
          isOptional = Boolean(isOptional);

          let stringPattern = String.raw `(\S+|'.+?'|".+?")`;
          let numberPattern = String.raw `(\d+?)`;

          parameters.push({ type, location, isOptional });

          switch (type) {
            case "string":
              patterns.push(filter || stringPattern);
              break;

            case "number":
              patterns.push(numberPattern);
              break;

            case "item":
              patterns.push(stringPattern);
              break;

            case "character":
              patterns.push(stringPattern);
              break;

            case "exit":
              patterns.push(stringPattern);
              break;

            default:
              throw new Error(`Unkown parameter type: ${type}.`);
              break;
          }

          if (isOptional) {
            patterns[patterns.length - 1] += "?";
          }
        } else if (/ \(/.test(node)) {
          patterns.push(String.raw `(?:\s+`);
        } else if (/\)/.test(node)) {
          patterns.push(String.raw `)?`);
        } else if (/[^<>()\s]+/.test(node)) {
          if (node.includes("/")) {
            let synonyms = node.split("/").join("|");
            patterns.push(String.raw `(?:${synonyms})`);
          } else {
            patterns.push(node);
          }
        } else if (/\s+/.test(node)) {
          patterns.push(String.raw `\s+`);
        }
      }
    }

    super(`^${patterns.join("")}$`);

    this.parameters = parameters;
  }

  exec(argument, user) {
    let executionResult = super.exec(argument || "");

    if (executionResult === null) {
      user.message("Wrong Syntax");
      return null;
    } else {
      let isExecutionErrored = false;

      let mappedExecutionResult = executionResult.splice(1).map((parameter, index) => {
        let { type, location } = this.parameters[index];
        let scope = [];
        let item, character, exit;

        if (parameter == undefined) {
          return null;
        }

        parameter = stripSurroundingQuotes(parameter);

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
    let synonyms = base.split("/");

    this.base = synonyms[0];
    this.synonyms = synonyms;
    this.action = action;
    this.priority = priority;
    this.pattern = pattern;

    if (argument) {
      this.argument = new CommandArgument(argument);
    }
  }

  static execute(context, commandName, properties) {
    let command = game.commands.find((command) => command.base == commandName);

    if (command) {
      if (command.argument) {
        return command.action.apply(context, properties);
      } else {
        return command.action.call(context, command.base);
      }
    } else {
      throw new Error(`An attempt to execute nonexistant command ${commandName}`)
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
