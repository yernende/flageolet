import Model from "./model";

export default class Movable extends Model {
	move(destination) {
		if (this.location) {
			this.location.members.delete(this);
			this.location.subscribers.delete(this);
		}

		this.location = destination;
		destination.members.add(this);
		destination.subscribers.add(this);
	}
}
