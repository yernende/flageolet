import stream from "stream";

import Destination from "./destination";

export default class Room extends Destination {
	constructor() {
		super();

		this.events = new stream.Writable({
			objectMode: true,
			write: (data, encoding, done) => {
				for (let member of this.members) {
					member.events.write(data);
				}
			}
		});
	}
}
