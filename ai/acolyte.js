const AI = require("../src/ai");

module.exports = class AcolyteAI extends AI {
  ["Talk"](character) {
    this.tell(character, {
      en: `Good luck!`,
      ru: `Удачи!`
    });
  }

  ["Character Entered Game"](character) {
    this.tell(character, {
      en: `
        Greetings, stranger!

        You have now discovered for yourself a MUD of the new generation, most
        commonly known as Flageolet. Walk through the world and enjoy the game.
        Good luck!
      `,
      ru: `
        Приветствую тебя, странник!

        Ты только что открыл для себя MUD нового поколения, более известный как
        Флажолет. Для тебя открыт целый мир, полный загадок и опасностей.
        Отправляйся в путь, и пусть тебе сопутствует удача!
      `
    });
  }
}
