import {assert} from "chai";
import User from "../lib/user";
import Character from "../lib/character";
import Command from "../lib/command";
import stream from "stream";
import util from "util";

import describeAModel from "./shared/describe-a-model";

describe("User", () => {
	describe("#acceptQuery", () => {
		describe("result", () => {
			it("should be a next query received after the call", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);
					let queryToSend = "smile";

					user.acceptQuery().then((query) => {
						assert.equal(query, queryToSend);
						resolve();
					}).catch(reject);

					socket.write(queryToSend + "\n");
					user.releaseBuffer();
				});
			});
		});

		describe("if user is disconnected durring the acception", () => {
			it("should throw a 'user disconnected' error", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);

					user.acceptQuery().catch((error) => {
						assert.equal(error.message, "user disconnected");
						resolve();
					});

					socket.emit("close");
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
				let socket = new stream.PassThrough();
				let user = new User(socket);
				let queryToSend = "smile";

				user.once("query accept", (query) => {
					assert.equal(query, queryToSend);
					resolve();
				});

				user.acceptQuery();

				socket.write(queryToSend + "\n");
				user.releaseBuffer();
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
				let socket = new stream.PassThrough();
				let user = new User(socket);
				let account = {
					login: "user",
					password: "12345"
				};

				user.authorize([account]).then(() => {
					assert.equal(user.login, account.login);
					assert.equal(user.password, account.password);
					resolve();
				}).catch(reject);

				socket.write(account.login + "\n");
				socket.write(account.password + "\n");

				user.releaseBuffer();

				setImmediate(() => {
					user.releaseBuffer();
				})
			});
		});
	});

	describe("#acceptCommand", () => {
		it("should accept a query and perform a one command of passed to the method that matches it", () => {
			return new Promise((resolve, reject) => {
				let socket = new stream.PassThrough();
				let user = new User(socket);
				let command = new Command("resolve", () => {
					resolve();
				});

				user.acceptCommand([command]);
				socket.write("resolve" + "\n");
				user.releaseBuffer();
			});
		});

		it("should not reject when the accepted query doesn't match any command", () => {
			return new Promise((resolve, reject) => {
				let socket = new stream.PassThrough();
				let user = new User(socket);

				user.acceptCommand([]).then(resolve).catch(reject);
				socket.write("unkown query\n");
				user.releaseBuffer();
			});
		});

		it("should perform commands in context of a user's character", () => {
			return new Promise((resolve, reject) => {
				let socket = new stream.PassThrough();;
				let user = new User(socket);
				let character = new Character();
				user.character = character;

				let command = new Command("resolve", function() {
					assert.equal(this, character);
					resolve();
				});

				user.acceptCommand([command]);
				socket.write("resolve\n");
				user.releaseBuffer();
			});
		});

		describe("when the query is right", () => {
			it("should return result of command execution", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let	user = new User(socket);
					let expectedResult = {};

					let command = new Command("get expected result", () => {
						return expectedResult;
					});

					user.acceptCommand([command]).then((result) => {
						assert.equal(result, expectedResult);
						resolve();
					});

					socket.write("get expected result\n");
					user.releaseBuffer();
				});
			});
		});

		describe("when the query is wrong", () => {
			it("should emit a 'query fail' event", () => {
				return new Promise((resolve, reject) => {
					let socket = new stream.PassThrough();
					let user = new User(socket);

					user.on("query fail", resolve);

					user.acceptCommand([]);
					socket.write("unkown query\n");
					user.releaseBuffer();
				});
			});
		});
	});

	describeAModel("user", () => new User());
});
