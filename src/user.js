import stream from "stream";

export default class User {
	constructor() {
		this.queries = new stream.PassThrough();
		this.request = new Request(this);
	}

	acceptQuery() {
		return new Promise((resolve) => {
			this.queries.once("data", (data) => resolve(data.toString()));
		});
	}
}

class Request extends stream.Writable {
	constructor(user) {
		super();
		this._user = user;
		this._buffer = "";
	}

	_write(chunk, encoding, done) {
		let data = chunk.toString();

		for (let symbol of data) {
			if (symbol == "\n") {
				this._user.queries.write(this._buffer);
			} else {
				this._buffer += symbol;
			}
		}

		done();
	}
}
