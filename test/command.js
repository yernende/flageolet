import {assert} from "chai";
import Command from "../lib/command";

describe("Command", () => {
	describe("#test", () => {
		it("should return whether a passed string matches a command's pattern or not", () => {
			let lookCommand = new Command("look");
			assert.ok(lookCommand.test("look"));
		});
	});

	describe("#perform", () => {
		describe("when a passed string matches a command's pattern", () => {
			it("should call a command's action in the context of a passed object", () => {
				let model = {};

				let touchCommand = new Command("touch", function() {
					this.touched = true;
				});

				touchCommand.perform("touch", model);

				assert.ok(model.touched);
			});

			it("should pass to a called action values of a command's call parameters", () => {
				let character = {};

				let setNameCommand = new Command("name <name>", function({name}) {
					this.name = name;
				});

				setNameCommand.perform("name frodo", character);

				assert.equal(character.name, "frodo");
			});
		});
	});
});
