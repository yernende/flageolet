import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";

describe("CommandPattern", () => {
	describe("#test", () => {
		describe("just a word", () => {
			let pattern = new CommandPattern("look");

			it("should match to the same word", () => {
				assert.ok(pattern.test("look"));
				assert.notOk(pattern.test("smile"));
			});
		});

		describe("bracketed symbols", () => {
			let pattern = new CommandPattern("l(ook)");

			it("should treat as optional", () => {
				it("should check bracketed symbols as optional", () => {
					assert.ok(pattern.test("l"));
				});
			});
		});

		describe("<string>", () => {
			let pattern = new CommandPattern("get <string>");

			it("should match to any single word", () => {
				assert.ok(pattern.test("get sword"));
			});

			it("should match to any several single-quoted words", () => {
				assert.ok(pattern.test("get 'rusty sword'"));
			});

			it("should match to any several double-quoted words", () => {
				assert.ok(pattern.test("get \"rusty sword\""));
			});
		});

		describe("<string:[regular expression]>", () => {
			let pattern = new CommandPattern("<string:north>");

			it("should match according to that regular expression", () => {
				assert.ok(pattern.test("north"));
				assert.notOk(pattern.test("forward"));
			});
		});

		describe("<number>", () => {
			let pattern = new CommandPattern("count <number>");

			it("should match to any number", () => {
				assert.ok(pattern.test("count 1000"));
				assert.notOk(pattern.test("count pie"))
			});
		});

		it("should check a whole string for matching", () => {
			let pattern = new CommandPattern("quit");

			assert.notOk(pattern.test("quit the world"));
		});
	});

	describe("#exec", () => {
		describe("if no arguments passed", () => {
			it("should return null", () => {
				let pattern = new CommandPattern("look");

				assert.isNull(pattern.exec());
			});
		});

		describe("if a string passed that doesn't match the pattern", () => {
			it("should return null", () => {
				let pattern = new CommandPattern("look");

				assert.isNull(pattern.exec("smile"));
			});
		});

		describe("if a string passed that matches the pattern", () => {
			it("should return an array of matched parameters", () => {
				let pattern = new CommandPattern("get <string>");
				let parameters = pattern.exec("get 'rusty sword'");

				assert.equal(parameters[0], "rusty sword");
			});

			it("should return `number` type parameters as numbers", () => {
				let pattern = new CommandPattern("count <number>");
				let parameters = pattern.exec("count 100");

				assert.isNumber(parameters[0]);
				assert.equal(parameters[0], 100);
			});
		});
	});
});
