import stream from "stream";

export default class User {
	constructor() {
		this.queries = new stream.PassThrough();
	}

	acceptQuery() {
		return new Promise((resolve) => {
			this.queries.once("data", (data) => resolve(data.toString()));
		});
	}
}
