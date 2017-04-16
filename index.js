const net = require("net");
const fs = require("fs");
const game = require("./src/game");
const User = require("./src/user");
const Command = require("./src/command");

for (let file of fs.readdirSync("./commands")) {
  game.commands.push(...require(`./commands/${file}`).map((command) => new Command(command)));
}

for (let file of fs.readdirSync("./messages")) {
  game.messages.push(...require(`./messages/${file}`));
}

require("./init-world");

const server = net.createServer((connection) => {
  let user = new User(connection);
  user.language = "ru";

  connection.on("data", (data) => {
    user.input.push(data.toString());
  });

  connection.on("close", () => {
    game.users.splice(game.users.indexOf(user), 1);
  })

  game.users.push(user);
  user.character.move(game.world.rooms.get(0));

  user.character.location.broadcast({
    filter: (target) => target != user.character,
    message: ["Character Entered Game", user.character]
  });
}).listen(4000);

setInterval(function () {
  for (let user of game.users) {
    user.handleInput();
    user.handleOutput();
  }
}, 125);
