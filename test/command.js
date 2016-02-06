import {assert} from "chai";
import Command from "../lib/command";

describe("Command", () => {
	describe("#matches", () => {
		it("should return whether a passed string matches the command's pattern or not", () => {
			let lookCommand = new Command("look");
			assert.ok(lookCommand.matches("look"));
		});
	});

	describe("#perform", () => {
		describe("when a query passed that matches the command's pattern", () => {
			it("should call the command's action in the context of a passed object", () => {
				let model = {};

				let touchCommand = new Command("touch", function() {
					this.touched = true;
				});

				touchCommand.perform("touch", model);

				assert.ok(model.touched);
			});

			it("should pass to the called action parametres from the query", () => {
				let character = {};

				let setNameCommand = new Command("name <name>", function(name) {
					this.name = name;
				});

				setNameCommand.perform("name frodo", character);

				assert.equal(character.name, "frodo");
			});

			it("should return a result of command's action execution", () => {
				let expectedResult = {};

				let getExpectedResult = new Command("get result", function() {
					return expectedResult;
				});

				assert.equal(getExpectedResult.perform("get result"), expectedResult);
			});
		});

		describe("when a query passed that doesn't match the command's pattern", () => {
			it("should throw an error", () => {
				let lookCommand = new Command("look", () => {});

				assert.throw(() => {
					lookCommand.perform("smile", {})
				}, "query should match the command's pattern");
			});
		});
	});
});
