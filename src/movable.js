import Model from "./model";

export default class Movable extends Model {
	constructor(name, location) {
		super();

		this.name = name;

		if (location) {
			this.move(location);
		}
	}

	move(destination) {
		if (this.location) {
			this.location.members.delete(this);
			this.location.subscribers.delete(this);
		}

		if (destination !== null) {
			destination.members.add(this);
			destination.subscribers.add(this);
		}

		this.location = destination;
	}
}
