import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";

let commandPatterns = {
	look: new CommandPattern("look"),
	quit: new CommandPattern("quit"),
	get: new CommandPattern("get <item>")
}

describe("CommandPattern", () => {
	describe("#test", () => {
		it("should return whether a passed string matches a pattern or not", () => {
			assert.ok(commandPatterns.look.test("look"));
			assert.notOk(commandPatterns.look.test("smile"));
		});

		it("should check a whole string for matching", () => {
			assert.notOk(commandPatterns.quit.test("quit the world"));
		});

		describe("a word in angle brackets", () => {
			it("should match a single arbitrary word", () => {
				assert.ok(commandPatterns.get.test("get sword"));
			});

			it("should match several arbitrary single-quoted words", () => {
				assert.ok(commandPatterns.get.test("get 'rusty sword'"));
			});

			it("should match several arbitrary double-quoted words", () => {
				assert.ok(commandPatterns.get.test("get \"rusty sword\""));
			});
		});
	});

	describe("#exec", () => {
		describe("if no arguments passed", () => {
			it("should return null", () => {
				assert.isNull(commandPatterns.look.exec());
			});
		});

		describe("if a string passed that doesn't match the pattern", () => {
			it("should return null", () => {
				assert.isNull(commandPatterns.look.exec("smile"));
			});
		});

		describe("if a string passed that matches the pattern", () => {
			describe("result", () => {
				it("should be an object", () => {
					assert.isObject(commandPatterns.get.exec("get sword"));
				});

				it("should store parameter values by parameter names as keys", () => {
					let parameters = commandPatterns.get.exec("get 'rusty sword'");

					assert.equal(parameters.item, "rusty sword");
				});
			});
		});
	});
});
