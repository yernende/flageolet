const AI = require("../src/ai");

module.exports = class AcolyteAI extends AI {
  constructor() {
    super();

    this.memory.charactersMet = new Set();
  }

  ["Character Arrived"](character) {
    if (this.memory.charactersMet.has(character)) return;

    character.owner.message("AI Message", this.character, `
      Greetings, stranger!

      You have now discovered for yourself a MUD of the new generation, most
      commonly known as Flageolet. Walk through the world and enjoy the game.
      Let the Phoenix be with you!
    `);

    this.memory.charactersMet.add(character);
  }
}
