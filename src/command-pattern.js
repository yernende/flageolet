import Item from "./item";

export default class CommandPattern extends RegExp {
	constructor(pattern) {
		let parameters = [];
		let nodes = pattern.match(/<.+?:.+?>|<.+?>|\(\w+\)|\w+|\s+/g);

		let patterns = nodes.map((node) => {
			let pattern;

			if (/<.+?(?::.+?)?>/.test(node)) {
				let [, type, filter] = /<(.+?)(?::(.+?))?>/.exec(node);

				switch (type) {
					case "string":
						parameters.push("string");

						pattern = filter || String.raw `(\S+|'.+?'|".+?")`;
						break;

					case "number":
						parameters.push("number");

						pattern = String.raw `(\d+?)`;
						break;

					case "item":
						parameters.push("item");

						pattern = String.raw `(\S+|'.+?'|".+?")`;
						break;

					case "item@inventory":
						parameters.push("item@inventory");

						pattern = String.raw `(\S+|'.+?'|".+?")`;
						break;
				}
			} else if (/\(\w+\)/.test(node)) {
				let [, word] = /\((\w+)\)/.exec(node);
				pattern = String.raw `(?:${word})?`;
			} else if (/\w+/.test(node)) {
				pattern = node;
			} else if (/\s+/.test(node)) {
				pattern = String.raw `\s+`;
			}

			return pattern;
		});

		super(`^${patterns.join("")}$`);

		this.parameters = parameters;
	}

	test(string, actor) {
		let executionResult = super.exec(string);

		if (executionResult === null) {
			return false;
		} else {
			return executionResult.slice(1).every((parameter, index) => {
				let type = this.parameters[index];

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
				let type = this.parameters[index];

				switch (type) {
					case "string":
						return stripSurroundingQuotes(parameter);
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

function getLocation(type, actor) {
	switch (type) {
		case "inventory":
			return actor.inventory;

		default:
			return actor.location;
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
