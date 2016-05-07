import User from "./user";

const users = new Set();

const flageolet = {
	run() {
			setInterval(() => {
			for (let user of users) {
				user.releaseBuffer();
			}
		}, 125);
	},

	async handleConnection(socket, authorize) {
		let user;

		try {
			user = new User(socket);
			users.add(user);
			await authorize(user);
		} catch (error) {
			console.log(error.stack);
			return;
		}

		while (true) {
			try {
				await user.acceptCommand(this.commands);
			} catch (error) {
				if (error.message == "user disconnected") {
					user.purge();
					users.delete(user);
					break;
				} else {
					console.log(error.stack);
				}
			}
		}
	}
}

export default flageolet;
