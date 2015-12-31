import {assert} from "chai";
import Room from "../lib/room";

import Character from "../lib/character";

import describeAModel from "./shared/describe-a-model";

describe("Room", () => {
	describe("#events", () => {
		it("should transmit input objects to its members", () => {
			return new Promise((resolve, reject) => {
				let room = new Room();
				let character = new Character();
				let eventToSend = {
					name: "notification",
					data: "hello"
				};

				character.move(room);

				character.events.on("data", (event) => {
					assert.equal(event, eventToSend);
					resolve();
				});

				room.events.write(eventToSend);
			});
		});
	});

	describeAModel(Room);
});
