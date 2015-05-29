import {assert} from "chai";
import commands from "../lib/commands";
import CommandList from "../lib/command-list";

describe("commands", () => {
	it("should be an instance of CommandList", () => {
		assert.instanceOf(commands, CommandList);
	});
});
