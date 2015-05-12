import {assert} from "chai";
import Command from "../lib/command";

describe("Command", () => {
	describe("#test", () => {
		it("should return whether a passed string matches a command's pattern or not", () => {
			let lookCommand = new Command("look");
			assert.ok(lookCommand.test("look"));
		});
	});
});
