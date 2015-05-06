export default class CommandPattern extends RegExp {
    constructor(pattern) {
        let parameterNames = [];
        let nodePatterns = [];

        pattern.match(/\S+|<.+?>/g).map((node) => {
            if (/<.+?>/.test(node)) {
                let [, name] = /<(.+?)>/.exec(node);
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
        }).forEach((node, index) => {
            let nodePattern;

            switch (node.type) {
                case "word":
                    nodePattern = node.value;
                    break;
                case "parameter":
                    parameterNames.push(node.name);
                    nodePattern = String.raw`(\S+|'.+?'|".+?")`;
                    break;
            }

            nodePatterns.push(nodePattern);
        });

        super(`^${nodePatterns.join(" ")}$`);

        Object.assign(this, {parameterNames});
    }

    exec(string) {
        if (!string) {
            return null;
        }

        let parameters = new Map();
        let [, ...values] = super.exec(string);

        values.forEach((value, index) => {
            value = stripSurroundingQuotes(value);
            parameters.set(this.parameterNames[index], value);
        });

        return parameters;
    }
};

function stripSurroundingQuotes(string) {
    if (string.startsWith("'") && string.endsWith("'")) {
        string = string.slice(1, -1);
    } else if (string.startsWith("\"") && string.endsWith("\"")) {
        string = string.slice(1, -1);
    }

    return string;
}
