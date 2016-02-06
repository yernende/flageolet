import CommandPattern from "./command-pattern";

export default class Command {
	constructor(pattern, action) {
		this.pattern = new CommandPattern(pattern);
		this.action = action;
	}

	matches(string, actor) {
		return this.pattern.test(string, actor);
	}

	perform(query, actor) {
		let parameters = this.pattern.exec(query, actor);

		if (parameters == null) {
			throw new Error("query should match the command's pattern");
		}

		return this.action.call(actor, ...parameters);
	}
}
