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

        describe("a word in angle brackets", () => {
            it("should match a single arbitrary word", () => {
                let getPattern = new CommandPattern("get <word>");
                assert.ok(getPattern.test("get sword"));
            });
        })
    });
});
