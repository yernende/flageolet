import {assert} from "chai";
import User from "../lib/user";
import stream from "stream";
import util from "util";

describe("User", () => {
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
