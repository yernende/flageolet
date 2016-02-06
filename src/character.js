import stream from "stream";

import Movable from "../lib/movable";
import Destination from "./destination";

export default class Character extends Movable {
	constructor() {
		super(...arguments);

		this.inventory = new Destination();
	}
}
