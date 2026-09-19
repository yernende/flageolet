const fs = require("node:fs");
const path = require("node:path");
const game = require("../src/game");
const User = require("../src/user");
const Character = require("../src/character");
const Item = require("../src/item");
const Room = require("../src/room");
const Area = require("../src/area");
const Command = require("../src/command");

const root = path.resolve(__dirname, "..");
const stripAnsi = (text) => text.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "").replace(/\r/g, "");

function setupWorld({areasDirectory = path.join(root, "areas")} = {}) {
  game.commands.length = 0;
  game.messages.length = 0;
  game.users.length = 0;
  for (let map of Object.values(game.world)) map.clear();
  User.hooks.length = 0;
  Character.idCounter = 0;
  Item.idCounter = 0;

  function loadCommands(directory) {
    for (let file of fs.readdirSync(directory)) {
      game.commands.push(...require(path.join(directory, file)).map((data) => new Command(data)));
    }
    game.commands.sort((a, b) => a.priority - b.priority);
  }

  function loadMessages(directory) {
    for (let file of fs.readdirSync(directory)) game.messages.push(...require(path.join(directory, file)));
  }

  loadCommands(path.join(root, "commands"));
  loadMessages(path.join(root, "messages"));
  const context = {game, User, Character, Item, Room, Area, areasDirectory};
  for (let plugin of fs.readdirSync(path.join(root, "plugins"))) {
    if (plugin.startsWith("_")) continue;
    let folder = path.join(root, "plugins", plugin);
    if (fs.existsSync(path.join(folder, "commands"))) loadCommands(path.join(folder, "commands"));
    if (fs.existsSync(path.join(folder, "messages"))) loadMessages(path.join(folder, "messages"));
    if (fs.existsSync(path.join(folder, "index.js"))) require(path.join(folder, "index.js"))(context);
  }

  function makeUser(language = "en") {
    const connection = {
      destroyed: false,
      sent: [],
      write(text) { this.sent.push(text); },
      destroy() { this.destroyed = true; }
    };
    const user = new User(connection);
    user.language = language;
    game.users.push(user);
    user.character.move([...game.world.areas.values()][0].rooms.get(0));
    user.output = [];
    return user;
  }

  return {...context, makeUser};
}

async function interpret(user, query) {
  user.output = [];
  user.xterm.newLine = true;
  await user.interpret(query);
  return stripAnsi(user.output.join(""));
}

module.exports = {setupWorld, interpret, stripAnsi, root};
