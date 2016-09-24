const net = require("net");
const User = require("./lib/user");

const users = [];

const server = net.createServer((connection) => {
  let user = new User(connection);

  connection.on("data", (data) => {
    user.input.push(data.toString());
  });

  connection.on("close", () => {
    users.splice(users.indexOf(user), 1);
  })

  users.push(user);
}).listen(4000);

setInterval(function () {
  for (let user of users) {
    user.handleInput();
    user.handleOutput();
  }
}, 125);
