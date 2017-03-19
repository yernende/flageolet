const AI = require("../src/ai");

module.exports = class AcolyteAI extends AI {
  constructor() {
    super();

    this.memory.charactersMet = new Set();

    this.on("Character Arrived", (character) => {
      if (this.memory.charactersMet.has(character)) return;

      this.tell(character, "Greetings, stranger!");
      this.tell(character, "You have now discovered for yourself a MUD of the new generation, most commonly known as Flageolet.")
      this.tell(character, "Walk through the world and enjoy the game. Let the Phoenix be with you!");

      this.memory.charactersMet.add(character);
    });
  }

  tell(target, phrase) {
    target.owner.message("Private Message", this.character, phrase);
  }
}
