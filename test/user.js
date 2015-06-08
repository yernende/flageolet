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
		});
	});
});
