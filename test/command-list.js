import {assert} from "chai";
import CommandList from "../lib/command-list";
import Command from "../lib/command";

describe("CommandList", () => {
	it("should store commands on #push and return a first one that matches a passed query on #find", () => {
		let commands = new CommandList();
		let getCommand = new Command("get <item>");

		commands.push(getCommand);
		assert.equal(commands.find("get sword"), getCommand);
	});
});
