import stream from "stream";
import {inspect} from "util";

import {LineStream} from "byline";

import Model from "./model";

export default class User extends Model {
	constructor(socket) {
		super();

		this.queries = new stream.PassThrough();
		this.response = new stream.PassThrough();

		if (socket) {
			socket.pipe(new LineStream()).pipe(this.queries);
			this.response.pipe(socket);
		}
	}

	acceptQuery() {
		return new Promise((resolve) => {
			this.emit("query await");

			this.queries.once("data", (data) => {
				let query = data.toString();

				this.emit("query accept", query);
				resolve(query);
			});
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
		let command = commands.find((command) => command.matches(query));

		if (command) {
			return command.perform(query, this.character);
		} else {
			this.emit("query fail");
		}
	}

	assignAccount(account) {
		this.login = account.login;
		this.password = account.password;
	}
}
