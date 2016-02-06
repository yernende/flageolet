import Item from "./item";

export default class CommandPattern extends RegExp {
	constructor(pattern) {
		let nodes = pattern.match(/<.+?>|\(\w+\)|\w+|\s+/g);

		let patterns = [];
		let parameters = [];

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

					case "item":
						parameters.push("item");
						patterns.push(stringPattern);
						break;

					case "item@inventory":
						parameters.push("item@inventory");
						patterns.push(stringPattern);
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

		super(`^${patterns.join("")}$`);

		this.ast = {
			patterns,
			parameters
		};
	}

	test(string, actor) {
		let executionResult = super.exec(string);

		if (executionResult === null) {
			return false;
		} else {
			return executionResult.slice(1).every((parameter, index) => {
				parameter = stripSurroundingQuotes(parameter);
				let type = this.ast.parameters[index];

				switch (type) {
					case "item":
						return (
							Array.from(actor.location.members)
								.some((member) => member instanceof Item && member.name.startsWith(parameter))
						);

					case "item@inventory":
						return (
							Array.from(actor.inventory.members)
								.some((member) => member instanceof Item && member.name.startsWith(parameter))
						);

					default:
						return true;
				}
			})
		}
	}

	exec(string, actor) {
		let executionResult = super.exec(string);

		if (executionResult === null) {
			return null;
		} else {
			return executionResult.slice(1).map((parameter, index) => {
				parameter = stripSurroundingQuotes(parameter);
				let type = this.ast.parameters[index];

				switch (type) {
					case "string":
						return parameter;

					case "number":
						return Number(parameter);

					case "item":
						return (
							Array.from(actor.location.members)
								.find((member) => member instanceof Item && member.name.startsWith(parameter))
						);

					case "item@inventory":
						return (
							Array.from(actor.inventory.members)
								.find((member) => member instanceof Item && member.name.startsWith(parameter))
						);
				}
			});
		}
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
