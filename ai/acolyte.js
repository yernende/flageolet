const AI = require("../src/ai");

module.exports = class AcolyteAI extends AI {
  ["Character Entered Game"](character) {
    character.owner.message("AI Message", this.character, {
      en: `
        Greetings, stranger!

        You have now discovered for yourself a MUD of the new generation, most
        commonly known as Flageolet. Walk through the world and enjoy the game.
        Let the Phoenix be with you!
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
