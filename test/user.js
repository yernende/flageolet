import {assert} from "chai";
import User from "../lib/user";
import Command from "../lib/command";
import stream from "stream";
import util from "util";

import describeAModel from "./shared/describe-a-model";

describe("User", () => {
	describe("constructor", () => {
		describe("when a socket object is passed", () => {
			it("should make user's `queries` stream to recieve data from the socket divided into lines", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);

					user.queries.once("data", (query) => {
						assert.equal(query, "smile");
						resolve();
					});

					socket.write("smi");
					socket.write("l");
					socket.write("e");
					socket.write("\n");
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

		it("should emit a 'query await' event on call", () => {
			return new Promise((resolve, reject) => {
				let user = new User();

				user.once("query await", () => {
					resolve();
				});

				user.acceptQuery();
			});
		});

		it("should emit a 'query accept' event on data receive", () => {
			return new Promise((resolve, reject) => {
				let user = new User();
				let queryToSend = "smile";

				user.once("query accept", (query) => {
					assert.equal(query, queryToSend);
					resolve();
				});

				user.acceptQuery();
				user.queries.write("smile");
			});
		});
	});

	describe("#renderMessage", () => {
		it("should render a passed object in the way similar to `util.inspect with enabled colors`", () => {
			let user = new User();
			let message = {
				name: "notification",
				data: "hello"
			};

			assert.equal(
				user.renderMessage(message),
				util.inspect(message, {colors: true})
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

	describe("#acceptCommand", () => {
		it("should accept a query and perform a one command of passed to the method that matches it", () => {
			return new Promise((resolve, reject) => {
				let user = new User();
				let command = new Command("resolve", () => {
					resolve();
				});

				user.acceptCommand([command]);
				user.queries.write("resolve");
			});
		});

		it("should not reject when the accepted query doesn't match any command", () => {
			return new Promise((resolve, reject) => {
				let user = new User();

				user.acceptCommand([]).then(resolve).catch(reject);
				user.queries.write("unkown query");
			});
		});

		describe("when the query is right", () => {
			it("should return result of command execution", () => {
				return new Promise((resolve, reject) => {
					let	user = new User();
					let expectedResult = {};

					let command = new Command("get expected result", () => {
						return expectedResult;
					});

					user.acceptCommand([command]).then((result) => {
						assert.equal(result, expectedResult);
						resolve();
					});

					user.queries.write("get expected result");
				});
			});
		});

		describe("when the query is wrong", () => {
			it("should emit a 'query fail' event", () => {
				return new Promise((resolve, reject) => {
					let user = new User();

					user.on("query fail", resolve);

					user.acceptCommand([]);
					user.queries.write("unkown query");
				});
			});
		});
	});

	describeAModel("user", () => new User());
});
