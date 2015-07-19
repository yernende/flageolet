import {assert} from "chai";
import Item from "../lib/item";

import Room from "../lib/room";

describe("Item", () => {
	describe("#move", () => {
		it("should change the item's location to a passed destination object", () => {
			let item = new Item();
			let destination = new Room();

			item.move(destination);
			assert.equal(item.location, destination);
		});

		it("should add the item to the destination's members", () => {
			let item = new Item();
			let destination = new Room();

			item.move(destination);
			assert.ok(destination.members.has(item));
		});

		it("should delete the item from its previous location members", () => {
			let item = new Item();
			let location = new Room();
			let destination = new Room();

			item.move(location);
			item.move(destination);

			assert.notOk(location.members.has(item));
		});
	});
});
