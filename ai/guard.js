const AI = require("../src/ai");

module.exports = class GuardAI extends AI {
  constructor() {
    super();
    this.memory.questReceivers = new WeakSet();
    this.memory.questCompletors = new WeakSet();
  }

  ["Talk"](character) {
    if (this.memory.questCompletors.has(character)) {
      this.tell(character, {
        en: `I gave you the key. You may pass.`,
        ru: `Я дал тебе ключ. Ты можешь идти.`
      });
    } else {
      this.dialog(character, {
        en: `Hey, bro! Do you want something from me?`,
        ru: `Привет, братишка! Ты что-то хотел?`
      }, [{
        en: `I need your cloth, your jackboots and your horse.`,
        ru: `Мне нужна твоя одежда, твои сапоги и лошадь.`,
        handler: () => {
          this.tell(character, {
            en: "Ha-ha! Fairy tails of the acolyte don't serve good for you. Get out!",
            ru: `Ха-ха! Ты что, сказок в своей келье перечитался? Проваливай давай!`
          });
        }
      }, {
        en: `Yep! I want to leave the temple.`,
        ru: `Да! Я хочу покинуть храм.`,
        test: (character) => !this.memory.questReceivers.has(character),
        handler: (character) => {
          this.tell(character, {
            en: `
              Wanna to leave the temple? Pass through the gates and discover for
              yourself the world? I ought to let you go, but first help me a little.

              *the guard looks around*

              Don't tell anybody, yeah? I... I lost my sword somewhere in the garden.
              I would find it myself, but I cannot leave my post. Bring the sword to
              me and I will open the gates.
            `,
            ru: `
              Хочешь покинуть храм? Пройти через врата и выпорхнуть в открытый мир?
              Я, конечно, обязан тебя пропустить, но сперва помоги мне немного.

              *стражник озирается по сторонам*

              Не говори никому, хорошо? Я... я оставил свой меч где-то в саду. Я бы
              нашёл его сам, но мне не позволено покидать пост. Принеси мне меч и я
              выпущу тебя, лады?
            `
          });

          this.memory.questReceivers.add(character);
        }
      }, {
        en: `Nothing important... Just wanted to ask about your deals. Farewell.`,
        ru: `Да так... Зашёл узнать, как дела. Бывай.`
      }, {
        test: (character) => (
          this.memory.questReceivers.has(character) &&
          character.inventory.items.some((item) => item.name.en.includes("sword"))
        ),
        en: "I found your sword.",
        ru: "Я нашёл твой меч.",
        handler: (character) => {
          this.tell(character, {
            en: "Excelent! Give it to me.",
            ru: "Отлично! Давай его мне."
          });
        }
      }]);
    }
  }

  ["Character Arrived"](character) {
    if (this.memory.questReceivers.has(character)) {
      this.tell(character, {
        en: `Found my sword?`,
        ru: `Ну как, нашёл мой меч?`
      });
    }
  }

  ["Item Given"](actor, target, item) {
    if (this.memory.questIsDone) return;

    if (target == this.character) {
      if (item.name.en.includes("sword")) {
        this.tell(actor, {
          en: `
            *guard itches his head*

            That's not my sword... Okay, I will polish it and it will be as good
            as new. You have done your task. You may come through.
          `,
          ru: `
            *стражник чешет репу*

            Это не мой меч... Ай, ладно, протру и будет как новенький.
            Ты выполнил свою задачу. Можешь проходить.
          `
        });

        let key = this.character.inventory.items.find((item) => item.name.en.includes("key"));
        this.execute("give", key, actor);
        this.memory.questReceivers.delete(actor);
        this.memory.questCompletors.add(actor);
      }
    }
  }
}
