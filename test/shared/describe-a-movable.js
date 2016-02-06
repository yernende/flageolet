import {assert} from "chai";

import Room from "../../lib/room";
import Character from "../../lib/character";

const destinationTypes = [{
	name: "room",
	getInstance() {
		return new Room();
	}
}, {
	name: "inventory",
	getInstance() {
		return new Character().inventory;
	}
}];

export default function describeAsMovable(entityName, getEntityInstance) {
	describe("constructor", () => {
		it("should accept a name", () => {
			let character = new Character("player");

			assert.equal(character.name, "player");
		});

		it("should accept a location", () => {
			let room = new Room()
			let character = new Character("player", room);

			assert.equal(character.location, room);
		});
	});

	describe("#move", () => {
		for (let destinationType of destinationTypes) {
			it(`should change the ${entityName}'s location to a passed ${destinationType.name} object`, () => {
				let entity = getEntityInstance();
				let destination = destinationType.getInstance();

				entity.move(destination);
				assert.equal(entity.location, destination);
			});

			it(`should add the ${entityName} to the ${destinationType.name}'s members`, () => {
				let entity = getEntityInstance();
				let destination = destinationType.getInstance();

				entity.move(destination);
				assert.ok(destination.members.has(entity));
			});

			it(`should add the ${entityName} to the ${destinationType.name}'s subscribers`, () => {
			    let entity = getEntityInstance();
			    let destination = destinationType.getInstance();

			    entity.move(destination);
			    assert.ok(destination.subscribers.has(entity));
			});
		}

		it(`should delete the ${entityName} from its previous location members`, () => {
			let entity = getEntityInstance();
			let location = new Room();
			let destination = new Room();

			entity.move(location);
			entity.move(destination);

			assert.notOk(location.members.has(entity));
		});

		it(`should delete the ${entityName} from its previous location subscribers`, () => {
			let entity = getEntityInstance();
			let location = new Room();
			let destination = new Room();

			entity.move(location);
			entity.move(destination);

			assert.notOk(location.subscribers.has(entity));
		});
	});
}
