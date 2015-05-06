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
            let getPattern = new CommandPattern("get <word>");

            it("should match a single arbitrary word", () => {
                assert.ok(getPattern.test("get sword"));
            });

            it("should match several arbitrary single-quoted words", () => {
                assert.ok(getPattern.test("get 'rusty sword'"));
            });

            it("should match several arbitrary double-quoted words", () => {
                assert.ok(getPattern.test("get \"rusty sword\""));
            });
        })
    });

    describe("#exec", () => {
        describe("if no arguments passed", () => {
            it("should return null", () => {
                let lookPattern = new CommandPattern("look");
                assert.isNull(lookPattern.exec());
            });
        });

        describe("if a string passed as an argument", () => {
            describe("result", () => {
                it("should be an instance of Map", () => {
                    let getPattern = new CommandPattern("get <item>");
                    assert.instanceOf(getPattern.exec("get sword"), Map);
                });

                it("should store parameter values by parameter names as keys", () => {
                    let getPattern = new CommandPattern("get <item>");
                    let parameters = getPattern.exec("get 'rusty sword'");

                    assert.equal(parameters.get("item"), "rusty sword");
                });
            });
        });
    });
});
