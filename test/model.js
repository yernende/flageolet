import {assert} from "chai";
import Model from "../lib/model";

describe("Model", () => {
	describe("#emit", () => {
		it("should call the event's handlers binded via the `#on` method", () => {
			return new Promise((resolve, reject) => {
				let model = new Model();

				model.on("event", resolve);
				model.emit("event");
			})
		});

		it("should transmit the event to its subscribers", () => {
			return new Promise((resolve, reject) => {
				let model = new Model();
				let subscriber = new Model();

				model.subscribers.add(subscriber);

				subscriber.on("event", resolve);
				model.emit("event");
			});
		});
	});
});
