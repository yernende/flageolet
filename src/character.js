import stream from "stream";

export default class Character {
	constructor() {
		this.events = new stream.PassThrough({
			objectMode: true
		});
	}
}
