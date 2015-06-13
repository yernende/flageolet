import {assert} from "chai";
import User from "../lib/user";
import stream from "stream";

describe("User", () => {
	describe("#acceptQuery", () => {
		describe("result", () => {
			it("should be a next user#queries query pushed after the call", () => {
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

	describe("request", () => {
		it("should buffer incoming data and transmit it into the user#queries when a LF comes", () => {
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
});
