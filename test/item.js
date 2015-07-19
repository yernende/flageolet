import {assert} from "chai";
import Item from "../lib/item";

import Room from "../lib/room";

import describeAMovable from "./shared/describe-a-movable";

describe("Item", () => {
	describeAMovable(Item);
});
