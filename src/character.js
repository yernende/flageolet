import stream from "stream";

import Movable from "../lib/movable";

export default class Character extends Movable {
	constructor() {
		super();

		this.events = new stream.PassThrough({
			objectMode: true
		});
	}
}
