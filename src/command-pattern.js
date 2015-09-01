export default class CommandPattern extends RegExp {
	constructor(pattern) {
		let parameterNames = [];

		let nodes = pattern.match(/\S+|<.+?:.+?>|<.+?>/g);

		let ast = nodes.map((node) => {
			if (/<.+?:.+?>/.test(node)) {
				let [, name, pattern] = /<(.+?):(.+?)>/.exec(node);

				return {
					type: "parameter",
					pattern,
					name
				};
			} else if (/<.+?>/.test(node)) {
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
		});

		let astRender = ast.map((node) => {
			switch (node.type) {
				case "word":
					return node.value;
				case "parameter":
					parameterNames.push(node.name);
					return node.pattern || String.raw`(\S+|'.+?'|".+?")`;
			}
		}).join(" ");

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
