import EventEmitter from "events";

export default class Model extends EventEmitter {
	constructor() {
		super();

		this.subscribers = new Set();
	}

	emit(event, ...args) {
		for (let subscriber of this.subscribers) {
			subscriber.emit(event, ...args);
		}

		super.emit(event, ...args);
	}
}
