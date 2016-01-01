import {assert} from "chai";
import Character from "../lib/character";

import stream from "stream";
import Room from "../lib/room";

import describeAMovable from "./shared/describe-a-movable";
import describeAModel from "./shared/describe-a-model";

describe("Character", () => {
	describe("#inventory", () => {
		describeAModel("inventory", () => new Character().inventory);
	});

	describeAMovable("character", () => new Character());
	describeAModel("character", () => new Character());
});
