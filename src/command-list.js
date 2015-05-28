export default class CommandList extends Array {
	find(query) {
		for (let command of this) {
			if (command.test(query)) {
				return command;
			}
		}
	}
}
