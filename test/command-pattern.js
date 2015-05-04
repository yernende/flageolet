import {assert} from "chai";
import CommandPattern from "../lib/command-pattern";

describe("CommandPattern", () => {
    describe("#test", () => {
        it("should return whether a passed string matches a pattern or not", () => {
            let lookPattern = new CommandPattern("look");
            assert.ok(lookPattern.test("look"));
            assert.notOk(lookPattern.test("smile"));
        });

        it("should check a whole string for matching", () => {
            let quitPattern = new CommandPattern("quit");
            assert.notOk(quitPattern.test("quit the world"));
        });
    });
});
