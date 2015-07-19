import {assert} from "chai";

import Room from "../../lib/room";

export default function describeAsMovable(Entity) {
	let entityName = Entity.name.toLowerCase();

	describe("#move", () => {
		it(`should change the ${entityName}'s location to a passed room object`, () => {
			let entity = new Entity();
			let destination = new Room();

			entity.move(destination);
			assert.equal(entity.location, destination);
		});

		it(`should add the ${entityName} to the room's members`, () => {
			let entity = new Entity();
			let destination = new Room();

			entity.move(destination);
			assert.ok(destination.members.has(entity));
		});

		it(`should delete the ${entityName} from its previous location members`, () => {
			let entity = new Entity();
			let location = new Room();
			let destination = new Room();

			entity.move(location);
			entity.move(destination);

			assert.notOk(location.members.has(entity));
		});
	});
}
