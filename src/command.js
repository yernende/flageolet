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
		this.action.call(actor);
	}
}
