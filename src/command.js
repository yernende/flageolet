import CommandPattern from "./command-pattern";

export default class Command {
	constructor(pattern) {
		this.pattern = new CommandPattern(pattern);
	}

	test(string) {
		return this.pattern.test(string);
	}
}
