import {assert} from "chai";

export default function describeAModel(entityName, getEntityInstance) {
	describe("#emit", () => {
		it("should call the event's handlers binded via the `#on` method", () => {
			return new Promise((resolve, reject) => {
				let entity = getEntityInstance();

				entity.on("event", resolve);
				entity.emit("event");
			})
		});

		it(`should transmit the event to the ${entityName}'s subscribers`, () => {
			return new Promise((resolve, reject) => {
				let entity = getEntityInstance();
				let subscriber = getEntityInstance();

				entity.subscribers.add(subscriber);

				subscriber.on("event", resolve);
				entity.emit("event");
			});
		});
	});
}
