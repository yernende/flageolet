const net = require("net");
const fs = require("fs");
const game = require("./lib/game");
const User = require("./lib/user");
const Command = require("./lib/command");

for (let file of fs.readdirSync("./commands")) {
  game.commands.push(...require(`./commands/${file}`).map((command) => new Command(command)));
}

for (let file of fs.readdirSync("./format")) {
  game.messages.push(...require(`./format/${file}`));
}

const server = net.createServer((connection) => {
  let user = new User(connection);

  connection.on("data", (data) => {
    user.input.push(data.toString());
  });

  connection.on("close", () => {
    game.users.splice(game.users.indexOf(user), 1);
  })

  game.users.push(user);
}).listen(4000);

setInterval(function () {
  for (let user of game.users) {
    user.handleInput();
    user.handleOutput();
  }
}, 125);
