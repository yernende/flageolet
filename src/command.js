import CommandPattern from "./command-pattern";

export default class Command {
	constructor(pattern, action) {
		this.pattern = new CommandPattern(pattern);
		this.action = action;
	}

	test(string) {
		return this.pattern.test(string);
	}

	perform(query, actor) {
		let parameters = this.pattern.exec(query);

		if (parameters == null) {
			throw new Error("query should match the command's pattern");
		}

		this.action.call(actor, parameters);
	}
}
