export default class CommandPattern extends RegExp {
	constructor(pattern) {
		let parameterNames = [];

		let nodes = pattern.match(/<.+?:.+?>|<.+?>|\(\w+\)|\w+|\s+/g);

		let ast = nodes.map((node) => {
			if (/<.+?:.+?>/.test(node)) {
				let [, name, pattern] = /<(.+?):(.+?)>/.exec(node);

				return {
					type: "parameter",
					pattern,
					name
				};
			} else if (/<.+?>/.test(node)) {
				let [, name] = /<(.+?)>/.exec(node);

				return {
					type: "parameter",
					pattern: /(\S+|'.+?'|".+?")/.source,
					name
				};
			} else if (/\(\w+\)/.test(node)) {
				let [, pattern] = /\((\w+)\)/.exec(node);

				return {
					type: "word",
					pattern: `(?:${pattern})?`
				}
			} else if (/\w+/.test(node)) {
				return {
					type: "word",
					pattern: node
				};
			} else if (/\s+/.test(node)) {
				return {
					type: "space",
					pattern: /\s+/.source
				}
			}
		});

		for (let node of ast) {
			if (node.type == "parameter") {
				parameterNames.push(node.name);
			}
		}

		let astRender = ast.reduce((accumulation, node) => accumulation + `(?:${node.pattern})`, "");

		super(`^${astRender}$`);

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
	if (string.startsWith("'") && string.endsWith("'")) {
		string = string.slice(1, -1);
	} else if (string.startsWith("\"") && string.endsWith("\"")) {
		string = string.slice(1, -1);
	}

	return string;
}
