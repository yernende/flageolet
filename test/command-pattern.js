import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";

let commandPatterns = {
	look: new CommandPattern("look"),
	quit: new CommandPattern("quit"),
	get: new CommandPattern("get <item>"),
	go: new CommandPattern("<direction:north>")
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

		describe("when the pattern includes a word in angle brackets", () => {
			it("should treat the word as matching a single arbitrary word", () => {
				assert.ok(commandPatterns.get.test("get sword"));
			});

			it("should treat the word as matching several arbitrary single-quoted words", () => {
				assert.ok(commandPatterns.get.test("get 'rusty sword'"));
			});

			it("should treat the word as matching several arbitrary double-quoted words", () => {
				assert.ok(commandPatterns.get.test("get \"rusty sword\""));
			});

			describe("when the word is followed with a regular expression", () => {
				it("should treat the word as matching similar to that regular expression", () => {
					assert.ok(commandPatterns.go.test("north"));
					assert.notOk(commandPatterns.go.test("forward"));
				});
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
			it("should return an object", () => {
				assert.isObject(commandPatterns.look.exec("look"));
			});
		});

		describe("when the pattern includes a word in angle brackets", () => {
			it("should treat the word as matching a single arbitrary word", () => {
				assert.ok(commandPatterns.get.test("get sword"));
			});

			it("should treat the word as matching several arbitrary single-quoted words", () => {
				assert.ok(commandPatterns.get.test("get 'rusty sword'"));
			});

			it("should treat the word as matching several arbitrary double-quoted words", () => {
				assert.ok(commandPatterns.get.test("get \"rusty sword\""));
			});

			it("should include the word's matched value to the method's result", () => {
				let parameters = commandPatterns.get.exec("get 'rusty sword'");
				assert.equal(parameters.item, "rusty sword");
			});
		});
	});
});
