const AI = require("../src/ai");

module.exports = class GuardAI extends AI {
  constructor({sword, key} = {}) {
    super();
    this.sword = sword;
    this.key = key;
    this.memory.questReceivers = new WeakSet();
    this.memory.questIsDone = false;
  }

  ["Talk"]({character}) {
    if (this.memory.questIsDone) return this.explainCompletion(character);
    if (this.hasReturnedSword()) return this.offerReward(character);

    this.dialog(character, {
      en: "Hello, traveller. What can I do for you?",
      ru: "Привет, путник. Что ты хотел?"
    }, [{
      en: "I need your clothes, your boots, and your horse.",
      ru: "Мне нужна твоя одежда, твои сапоги и лошадь.",
      handler: () => {
        this.tell(character, {
          en: "Ha! You have been listening to too many stories. Try again.",
          ru: "Ха! Видно, ты сказок в своей келье перечитался. Попробуй ещё раз."
        });
      }
    }, {
      en: "I want to leave the temple.",
      ru: "Я хочу покинуть храм.",
      test: () => !this.memory.questReceivers.has(character),
      handler: () => {
        if (this.memory.questIsDone) return this.explainCompletion(character);
        if (this.hasReturnedSword()) return this.offerReward(character);

        this.tell(character, {
          en: "I can give you the gate key, but first I need a favour.\nI left my sword somewhere in the gardens, and I cannot leave\nmy post. Bring it back to me, and the key is yours.",
          ru: "Я дам тебе ключ от ворот, но сперва помоги мне.\nЯ оставил свой меч где-то в садах, а покидать пост нельзя.\nПринеси мне меч, и ключ твой."
        });
        this.memory.questReceivers.add(character);
      }
    }, {
      en: "Nothing for now. Farewell.",
      ru: "Пока ничего. Бывай."
    }, {
      en: "I found your sword.",
      ru: "Я нашёл твой меч.",
      test: () => this.sword && character.inventory.items.includes(this.sword),
      handler: () => {
        if (this.memory.questIsDone) return this.explainCompletion(character);

        this.tell(character, {
          en: "Excellent! Give it to me, and I will hand you the key.",
          ru: "Отлично! Дай его мне, и я передам тебе ключ."
        });
      }
    }]);
  }

  ["Character Arrived"]({character}) {
    if (!this.memory.questIsDone && !this.hasReturnedSword() && this.memory.questReceivers.has(character)) {
      this.tell(character, {
        en: "Have you found my sword?",
        ru: "Ну как, нашёл мой меч?"
      });
    }
  }

  ["Item Given"]({actor, target, item}) {
    if (target != this.character || item !== this.sword) return;
    if (this.memory.questIsDone) return this.explainCompletion(actor);

    this.giveReward(actor);
  }

  hasReturnedSword() {
    return this.sword && this.sword.location === this.character.inventory;
  }

  offerReward(character) {
    this.dialog(character, {
      en: "The sword is back. I still need to hand over the gate key.",
      ru: "Меч вернулся. Осталось передать путникам ключ от ворот."
    }, [{
      en: "May I have the key?",
      ru: "Можно мне взять ключ?",
      handler: () => this.giveReward(character)
    }, {
      en: "I will come back later.",
      ru: "Я вернусь позже."
    }]);
  }

  giveReward(character) {
    if (this.memory.questIsDone) return this.explainCompletion(character);
    if (!this.hasReturnedSword()) return;

    if (!this.key || this.key.location !== this.character.inventory) {
      this.tell(character, {
        en: "The sword is back, but I cannot find the gate key.\nBring the key back if you find it, then speak to me again.",
        ru: "Меч вернулся, но ключ от ворот куда-то пропал.\nЕсли найдёшь ключ, верни его мне и поговори со мной снова."
      });
      return;
    }

    if (character.inventory.items.length >= character.inventory.capacity) {
      this.tell(character, {
        en: "Your hands are full. Make room for the key and talk to me again.",
        ru: "У тебя заняты руки. Освободи место для ключа и поговори со мной снова."
      });
      return;
    }

    if (this.execute("give", this.key, character) !== true) return;

    this.memory.questIsDone = true;
    this.tell(character, {
      en: "That is not quite my sword... A little polish will do!\nThank you. This key unlocks the northern gates.\nOnce opened, the passage is shared by all travellers.",
      ru: "Это не совсем мой меч... Ай, протру — будет как новенький!\nСпасибо. Этот ключ отпирает северные ворота.\nКогда их откроют, пройти сможет любой путник."
    });
  }

  explainCompletion(character) {
    this.tell(character, {
      en: "The sword is back, and the gate key has been handed over.\nUse the key to unlock the northern gates, then pass through.",
      ru: "Меч вернулся, а ключ от ворот я уже передал путникам.\nОтоприте ключом северные ворота — и можно проходить."
    });
  }
};
