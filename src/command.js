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

          let stringPattern = String.raw `('.+?'|".+?"|\S+)`;
          let stringGreedyPattern = String.raw `(.+)`;
          let numberPattern = String.raw `(\d+)`;

          parameters.push({ type, location, isOptional });

          switch (type) {
            case "string":
              patterns.push(filter || stringPattern);
              break;

            case "string greedy":
              patterns.push(stringGreedyPattern);
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
            let optional = patterns.pop();
            if (patterns[patterns.length - 1] == String.raw `\s+`) {
              patterns.pop();
              patterns.push(String.raw `(?:\s+${optional})?`);
            } else {
              patterns.push(optional + "?");
            }
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

    super(`^${patterns.join("")}$`, "i");

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
          case "string greedy":
            return parameter;

          case "number":
            return Number(parameter);

          case "item":
            if (location && location.includes("location")) {
              scope.push(...user.character.location.items);
            }

            if (location && location.includes("inventory")) {
              scope.push(...user.character.inventory.items);
            }

            item = scope.find(
              (item) => matchesName(item, parameter)
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
              (character) => matchesName(character, parameter)
            );

            if (character) {
              return character;
            } else {
              user.message("Unkown Character");
              isExecutionErrored = true;
              return;
            }

          case "exit":
            exit = user.character.location.exits.find((exit) => exit.direction.startsWith(parameter.toLowerCase()));

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
  constructor({pattern, action, priority = 10, requireFullType = false}) {
    let [, base, argument] = /(\S+)(?:\s+(.+))?/.exec(pattern);
    let synonyms = base.split("/");

    this.base = synonyms[0];
    this.synonyms = synonyms;
    this.action = action;
    this.priority = priority;
    this.pattern = pattern;
    this.requireFullType = requireFullType;

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

function matchesName(entity, query) {
  let names = typeof entity.name == "string" ? [entity.name] : Object.values(entity.name);
  return [...entity.keywords, ...names].some((name) => name.toLowerCase().startsWith(query.toLowerCase()));
}

module.exports = Command;
