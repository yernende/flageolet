import stream from "stream";
import EventEmitter from "events";

import {LineStream} from "byline";

import Model from "./model";

export default class User extends Model {
	constructor(socket) {
		super();

		this.buffer = {
			input: [],
			output: []
		}

		if (socket) {
			this.socket = socket;

			this.socket.pipe(new LineStream()).on("data", (data) => {
				this.buffer.input.push(data);
			});
		}
	}

	releaseBuffer() {
		let input = this.buffer.input;
		let output = this.buffer.output;

		if (input.length > 0) {
			this.emit("query", input.shift());
		}

		if (output.length > 0) {
			while (output.length > 0) {
				this.socket.write(output.shift());
			}

			if (this.status) {
				this.socket.write(this.status + "\n");
			}
		}
	}

	acceptQuery() {
		return new Promise((resolve, reject) => {
			let onData;
			let onEnd;

			onData = (data) => {
				let query = data.toString();

				this.emit("query accept", query);
				resolve(query);

				this.socket.removeListener("close", onEnd);
			};

			onEnd = () => {
				reject(new Error("user disconnected"));
			};

			this.emit("query await");

			this.once("query", onData);
			this.socket.once("close", onEnd);
		});
	}

	send(data) {
		this.buffer.output.push(data);
	}

	async authorize(accounts) {
		let login = await this.acceptQuery();
		let password = await this.acceptQuery();

		let account = accounts.find((account) => account.login == login && account.password == password);

		this.assignAccount(account);
	}

	async acceptCommand(commands) {
		let query = await this.acceptQuery();
		let command = commands.find((command) => command.matches(query, this.character));

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
