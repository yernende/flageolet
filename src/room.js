import stream from "stream";

export default class Room {
	constructor() {
		this.members = new Set();

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
