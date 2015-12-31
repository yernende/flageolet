import {assert} from "chai";
import Character from "../lib/character";

import stream from "stream";
import Room from "../lib/room";

import describeAMovable from "./shared/describe-a-movable";
import describeAModel from "./shared/describe-a-model";

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

	describeAMovable(Character);
	describeAModel(Character);
});
