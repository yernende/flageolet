import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";
import Character from "../lib/character";
import Item from "../lib/item";
import Room from "../lib/room";

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

		describe("<item>", () => {
			let pattern = new CommandPattern("get <item>");

			let room = new Room();
			let actor = new Character("player", room);
			let item = new Item("tulipe", room);

			it("should match to name of an item in the actor's location", () => {
				assert.ok(pattern.test("get tulipe", actor));
				assert.notOk(pattern.test("get rose", actor));
			});
		});

		describe("<item@inventory>", () => {
			let pattern = new CommandPattern("drop <item@inventory>");

			let actor = new Character();
			let item = new Item("tulipe", actor.inventory);

			it("should match to name of an item in the actor's inventory", () => {
				assert.ok(pattern.test("drop tulipe", actor));
				assert.notOk(pattern.test("drop rose", actor));
			});
		});

		describe("<character>", () => {
			let pattern = new CommandPattern("look <character>");

			let room = new Room();
			let actor = new Character("player", room);
			let target = new Character("questor", room);

			it("should match to name of a character in the actor's location", () => {
				assert.ok(pattern.test("look questor", actor));
				assert.notOk(pattern.test("look healer", actor));
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
			describe("result", () => {
				it("should include <string> matchings", () => {
					let pattern = new CommandPattern("get <string>");
					let parameters = pattern.exec("get 'rusty sword'");

					assert.equal(parameters[0], "rusty sword");
				});

				it("should include <number> matchings", () => {
					let pattern = new CommandPattern("count <number>");
					let parameters = pattern.exec("count 100");

					assert.isNumber(parameters[0]);
					assert.equal(parameters[0], 100);
				});

				it("should include <item> matchings", () => {
					let pattern = new CommandPattern("get <item>");

					let room = new Room();
					let actor = new Character("player", room);
					let item = new Item("tulipe", room);

					let parameters = pattern.exec("get tulipe", actor);

					assert.equal(parameters[0], item);
				});

				it("should include <item@inventory> matchings", () => {
					let pattern = new CommandPattern("drop <item@inventory>");

					let actor = new Character();
					let item = new Item("tulipe", actor.inventory);

					let parameters = pattern.exec("drop tulipe", actor);

					assert.equal(parameters[0], item);
				});

				it("should include <character> matchings", () => {
					let pattern = new CommandPattern("look <character>");

					let room = new Room();
					let actor = new Character("player", room);
					let target = new Character("questor", room);

					let parameters = pattern.exec("look questor", actor);

					assert.equal(parameters[0], target);
				});
			});
		});
	});
});
