export default class Movable {
	move(destination) {
		if (this.location) {
			this.location.members.delete(this);
		}

		this.location = destination;
		destination.members.add(this);
	}
}
