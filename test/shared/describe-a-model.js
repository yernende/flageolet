import {assert} from "chai";

export default function describeAModel(Entity) {
	describe("#emit", () => {
		it("should call the event's handlers binded via the `#on` method", () => {
			return new Promise((resolve, reject) => {
				let entity = new Entity();

				entity.on("event", resolve);
				entity.emit("event");
			})
		});

		it("should transmit the event to its subscribers", () => {
			return new Promise((resolve, reject) => {
				let entity = new Entity();
				let subscriber = new Entity();

				entity.subscribers.add(subscriber);

				subscriber.on("event", resolve);
				entity.emit("event");
			});
		});
	});
}
