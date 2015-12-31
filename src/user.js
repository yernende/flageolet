import stream from "stream";
import {inspect} from "util";

import {LineStream} from "byline";

export default class User {
	constructor(socket) {
		this.queries = new stream.PassThrough();
		this.response = new stream.PassThrough();

		if (socket) {
			socket.pipe(new LineStream()).pipe(this.queries);
			this.response.pipe(socket);
		}
	}

	acceptQuery() {
		return new Promise((resolve) => {
			this.queries.once("data", (data) => resolve(data.toString()));
		});
	}

	renderMessage(message) {
		return inspect(message, {
			colors: true
		});
	}

	async authorize(accounts) {
		let login = await this.acceptQuery();
		let password = await this.acceptQuery();

		let account = accounts.find((account) => account.login == login && account.password == password);

		this.assignAccount(account);
	}

	async acceptCommand(commands) {
		let query = await this.acceptQuery();
		let command = commands.find((command) => command.test(query));

		if (command) {
			return command.perform(query, this);
		}
	}

	assignAccount(account) {
		this.login = account.login;
		this.password = account.password;
	}
}
