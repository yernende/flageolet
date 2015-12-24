import stream from "stream";

import Movable from "../lib/movable";
import Destination from "./destination";

export default class Character extends Movable {
	constructor() {
		super();

		this.events = new stream.PassThrough({
			objectMode: true
		});

		this.inventory = new Destination();
	}
}
