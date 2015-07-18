import {assert} from "chai";
import Character from "../lib/character";

import stream from "stream";
import Room from "../lib/room";

describe("Character", () => {
	describe("#events", () => {
		it("should pe a pipeable stream", () => {
			return new Promise((resolve, reject) => {
				let character = new Character();
				let eventToSend = {
					name: "notification",
					data: "hello"
				};

				let eventReciever = new stream.Writable({
					objectMode: true,
					write: (data, encoding, done) => {
						assert.equal(data, eventToSend);
						resolve();
					}
				});

				character.events.pipe(eventReciever);
				character.events.write(eventToSend);
			});
		});
	});

	describe("#move", () => {
		it("should change the character's location to a passed destination object", () => {
			let character = new Character();
			let destination = new Room();

			character.move(destination);
			assert.equal(character.location, destination);
		});

		it("should add the character to the destination's members", () => {
			let character = new Character();
			let destination = new Room();

			character.move(destination);
			assert.ok(destination.members.has(character));
		});
	});
});
