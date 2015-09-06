import {assert} from "chai";
import User from "../lib/user";
import stream from "stream";
import util from "util";

describe("User", () => {
	describe("constructor", () => {
		describe("when a socket object is passed", () => {
			it("should pipe the socket object to the user's request", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);
					let queryToSend = "smile";

					user.request.once("data", (data) => {
						assert.equal(data, queryToSend);
						resolve();
					});

					socket.write(queryToSend);
				});
			});

			it("should pipe the user's response to the socket object", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);
					let queryToSend = "smile";

					socket.once("data", (data) => {
						assert.equal(data, queryToSend);
						resolve();
					});

					user.response.write(queryToSend);
				});
			});
		});
	});

	describe("#acceptQuery", () => {
		describe("result", () => {
			it("should be a next `user#queries` query pushed after the call", () => {
				return new Promise((resolve, reject) => {
					let user = new User();
					let queryToSend = "smile";

					user.acceptQuery().then((query) => {
						assert.equal(query, queryToSend);
						resolve();
					}).catch(reject);

					user.queries.write(queryToSend);
				});
			});

			it("should be a string", () => {
				return new Promise((resolve, reject) => {
					let user = new User();

					user.acceptQuery().then((query) => {
						assert.typeOf(query, "string");
						resolve();
					}).catch(reject);

					user.queries.write("smile");
				});
			});
		});
	});

	describe("#renderEvent", () => {
		it("should render a passed object in the way similar to `util.inspect with enabled colors`", () => {
			let user = new User();
			let event = {
				name: "notification",
				data: "hello"
			};

			assert.equal(
				user.renderEvent(event),
				util.inspect(event, {colors: true})
			);
		});
	});

	describe("#authorize", () => {
		it("should assign to the user a one account of passed to the method that matches sent credentials", () => {
			return new Promise((resolve, reject) => {
				let user = new User();
				let account = {
					login: "user",
					password: "12345"
				};

				user.authorize([account]).then(() => {
					assert.equal(user.login, account.login);
					assert.equal(user.password, account.password);
					resolve();
				}).catch(reject);

				user.queries.write(account.login);

				setImmediate(() => {
					user.queries.write(account.password);
				});
			});
		});
	});

	describe("#request", () => {
		it("should buffer incoming data and transmit it into `user#queries` when LF comes", () => {
			return new Promise((resolve, reject) => {
				let user = new User();

				user.queries.once("data", (query) => {
					assert.equal(query, "smile");
					resolve();
				});

				user.request.write("smi");
				user.request.write("l");
				user.request.write("e");
				user.request.write("\n");
			});
		});
	});

	describe("#events", () => {
		it("should render incoming objects with `user#renderEvent` and pass results to `user#response`", () => {
			return new Promise((resolve, reject) => {
				let user = new User();
				let eventToSend = {
					name: "notification",
					data: "hello"
				};

				user.response.once("data", (data) => {
					assert.equal(data, user.renderEvent(eventToSend));
					resolve();
				});

				user.events.write(eventToSend);
			});
		});
	});
});
