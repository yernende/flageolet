const net = require("net");
const fs = require("fs");
const path = require("path");
const game = require("./src/game");
const User = require("./src/user");
const Command = require("./src/command");

for (let file of fs.readdirSync(path.join(__dirname, "./commands"))) {
  game.commands.push(...require(`./commands/${file}`).map((command) => new Command(command)));
  game.commands = game.commands.sort((a, b) => a.priority - b.priority);
}

for (let file of fs.readdirSync(path.join(__dirname, "./messages"))) {
  game.messages.push(...require(`./messages/${file}`));
}

require("./init-world");

const server = net.createServer((connection) => {
  let user = new User(connection);
  user.language = "ru";

  connection.on("data", (data) => {
    user.input.push(data.toString());
  });

  connection.on("error", (error) => {
    console.error(error);
  });

  connection.on("end", () => {
    user.execute("quit");
  });

  game.users.push(user);
  user.character.move(game.world.rooms.get(0));

  user.character.location.broadcast({
    filter: (target) => target != user.character,
    message: "Character Entered Game",
    data: {character: user.character},
  });
}).listen(7000);

setInterval(function () {
  for (let user of game.users) {
    user.handleInput();
    user.handleOutput();
  }
}, 125);
