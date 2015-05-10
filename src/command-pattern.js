export default class CommandPattern extends RegExp {
    constructor(pattern) {
        let parameterNames = [];

        let nodePatterns = pattern.match(/\S+|<.+?>/g).map((node) => {
            if (/<.+?>/.test(node)) {
                let name = node.slice(1, -1);
                return {
                    type: "parameter",
                    name
                };
            } else {
                return {
                    type: "word",
                    value: node
                };
            }
        }).map((node) => {
            switch (node.type) {
                case "word":
                    return node.value;
                case "parameter":
                    parameterNames.push(node.name);
                    return String.raw`(\S+|'.+?'|".+?")`;
            }
        });

        super(`^${nodePatterns.join(" ")}$`);

        this.parameterNames = parameterNames;
    }

    exec(string) {
        if (!string) {
            return null;
        }

        let executionResult = super.exec(string);

        if (executionResult === null) {
            return null;
        }

        let [, ...values] = executionResult;
        let parameters = {};

        for (let [index, value] of values.entries()) {
            value = stripSurroundingQuotes(value);
            parameters[this.parameterNames[index]] = value;
        }

        return parameters;
    }
}

function stripSurroundingQuotes(string) {
    let firstSymbol = string[0];
    let lastSymbol = string[string.length - 1];

    if (firstSymbol == "'" && lastSymbol == "'") {
        string = string.slice(1, -1);
    } else if (firstSymbol == "\"" && lastSymbol == "\"") {
        string = string.slice(1, -1);
    }

    return string;
}
