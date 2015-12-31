import Model from "./model";

export default class Destination extends Model {
	constructor() {
		super();

		this.members = new Set();
	}
}
