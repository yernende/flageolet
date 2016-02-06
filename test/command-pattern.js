import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";

let commandPatterns = {
	look: new CommandPattern("l(ook)"),
	quit: new CommandPattern("quit"),
	get: new CommandPattern("get <string>"),
	go: new CommandPattern("<string:north>"),
	count: new CommandPattern("count <number>")
}

describe("CommandPattern", () => {
	describe("#test", () => {
		describe("just a word", () => {
			it("should match to the same word", () => {
				assert.ok(commandPatterns.look.test("look"));
				assert.notOk(commandPatterns.look.test("smile"));
			});
		});

		describe("bracketed symbols", () => {
			it("should treat as optional", () => {
				it("should check bracketed symbols as optional", () => {
					assert.ok(commandPatterns.look.test("l"));
				});
			});
		});

		describe("<string>", () => {
			it("should match to any single word", () => {
				assert.ok(commandPatterns.get.test("get sword"));
			});

			it("should match to any several single-quoted words", () => {
				assert.ok(commandPatterns.get.test("get 'rusty sword'"));
			});

			it("should match to any several double-quoted words", () => {
				assert.ok(commandPatterns.get.test("get \"rusty sword\""));
			});
		});

		describe("<string:[regular expression]>", () => {
			it("should match according to that regular expression", () => {
				assert.ok(commandPatterns.go.test("north"));
				assert.notOk(commandPatterns.go.test("forward"));
			});
		});

		describe("<number>", () => {
			it("should match to any number", () => {
				assert.ok(commandPatterns.count.test("count 1000"));
				assert.notOk(commandPatterns.count.test("count pie"))
			});
		});

		it("should check a whole string for matching", () => {
			assert.notOk(commandPatterns.quit.test("quit the world"));
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
			it("should return an array of matched parameters", () => {
				let parameters = commandPatterns.get.exec("get 'rusty sword'");
				assert.equal(parameters[0], "rusty sword");
			});

			it("should return `number` type parameters as numbers", () => {
				let parameters = commandPatterns.count.exec("count 100");
				assert.isNumber(parameters[0]);
				assert.equal(parameters[0], 100);
			});
		});
	});
});
