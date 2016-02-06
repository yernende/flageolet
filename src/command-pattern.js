export default class CommandPattern extends RegExp {
	constructor(pattern) {
		let nodes = pattern.match(/<.+?:.+?>|<.+?>|\(\w+\)|\w+|\s+/g);

		let ast = nodes.map((node) => {
			if (/<.+?(?::.+?)?>/.test(node)) {
				let [, type, filter] = /<(.+?)(?::(.+?))?>/.exec(node);
				let pattern;

				switch (type) {
					case "string":
						pattern = filter || /(\S+|'.+?'|".+?")/.source;
						break;

					case "number":
						pattern = /\d+?/.source;
						break;
				}

				return {
					type: "parameter",
					pattern
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

		let astRender = ast.reduce((accumulation, node) => accumulation + `(?:${node.pattern})`, "");

		super(`^${astRender}$`);
	}

	exec(string) {
		if (!string) {
			return null;
		}

		let executionResult = super.exec(string);

		if (executionResult === null) {
			return null;
		}

		let [, ...parameters] = executionResult;
		parameters = parameters.map((parameter) => stripSurroundingQuotes(parameter));

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
