import stream from "stream";
import {inspect} from "util";

import {LineStream} from "byline";

export default class User {
	constructor() {
		this.queries = new stream.PassThrough();
		this.request = new stream.PassThrough();

		this.events = new stream.Writable({
			objectMode: true,
			write: (data, encoding, done) => {
				this.response.write(this.renderEvent(data));
				done();
			}
		});
		this.response = new stream.PassThrough();

		this.request.pipe(new LineStream()).pipe(this.queries);
	}

	acceptQuery() {
		return new Promise((resolve) => {
			this.queries.once("data", (data) => resolve(data.toString()));
		});
	}

	renderEvent(event) {
		return inspect(event, {
			colors: true
		});
	}
}
