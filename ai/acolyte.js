const AI = require("../src/ai");

module.exports = class AcolyteAI extends AI {
  ["Talk"]({character}) {
    this.dialog(character, {
      en: `Do you want to buy something?`,
      ru: `Ты хочешь что-то купить?`
    }, [{
      en: "Nope",
      ru: "Нет"
    }, {
      en: "Show me your merchandise.",
      ru: "Покажи мне свой товар",
      handler: () => {
        this.dialog(character, null, [...this.character.inventory.items.map((item) => Object.assign(item.name, {
          handler: () => {
            this.execute("give", item, character);
          }
        })), {
          en: "I won't buy nothing.",
          ru: "Я не буду ничего покупать."
        }]);
      }
    }])
  }

  ["Character Entered Game"]({character}) {
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
