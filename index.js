const net = require("net");
const fs = require("fs");
const path = require("path");
const game = require("./src/game");
const Command = require("./src/command");
const User = require("./src/user");
const Character = require("./src/character");
const Room = require("./src/room");
const Item = require("./src/item");
const Area = require("./src/area");

loadCommands(path.join(__dirname, "commands"));
loadMessages(path.join(__dirname, "messages"));
loadPlugins(path.join(__dirname, "plugins"));

// require("./init-world");

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
  user.character.move([...game.world.areas.values()][0].rooms.get(0));

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

function loadPlugins(directory) {
  for (let file of fs.readdirSync(path.join(directory))) {
    if (file.startsWith("_")) continue;

    let commandsPath = path.join(directory, file, "commands");
    let messagesPath = path.join(directory, file, "messages");

    if (fs.existsSync(commandsPath)) loadCommands(commandsPath);
    if (fs.existsSync(messagesPath)) loadMessages(messagesPath);

    let pluginLoaderPath = path.join(directory, file, "index.js");

    if (fs.existsSync(pluginLoaderPath)) {
      require(pluginLoaderPath)({User, Character, Room, Item, Area, game});
    }
  }
}

function loadCommands(directory) {
  for (let file of fs.readdirSync(directory)) {
    game.commands.push(...require(path.join(directory, file)).map((command) => new Command(command)));
    game.commands = game.commands.sort((a, b) => a.priority - b.priority);
  }
}

function loadMessages(directory) {
  for (let file of fs.readdirSync(directory)) {
    game.messages.push(...require(path.join(directory, file)));
  }
}
