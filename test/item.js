import {assert} from "chai";
import Item from "../lib/item";

import Room from "../lib/room";

import describeAMovable from "./shared/describe-a-movable";
import describeAModel from "./shared/describe-a-model";

describe("Item", () => {
	describeAMovable(Item);
	describeAModel(Item);
});
