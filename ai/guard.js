const AI = require("../src/ai");

module.exports = class GuardAI extends AI {
  constructor() {
    super();
    this.memory.charactersVisited = new Set();
    this.memory.questIsDone = false;
  }

  ["Character Arrived"](character) {
    if (this.memory.questIsDone) return;

    if (this.memory.charactersVisited.has(character)) {
      character.owner.message("AI Message", this.character, {
        en: `Found my sword?`,
        ru: `Ну как, нашёл мой меч?`
      });
    } else {
      character.owner.message("AI Message", this.character, {
        en: `
          Hey, bro!

          Wanna to leave the temple? Pass through the gates and discover for
          yourself the world? I ought to let you go, but first help me a little.

          *the guard looks around*

          Don't tell anybody, yeah? I... I lost my sword somewhere in the garden.
          I would find it myself, but I cannot leave my post. Bring the sword to
          me and I will open the gates.
        `,
        ru: `
          Привет, братишка!

          Хочешь покинуть храм? Пройти через врата и выпорхнуть в открытый мир?
          Я, конечно, обязан тебя пропустить, но сперва помоги мне немного.

          *стражник озирается по сторонам*

          Не говори никому, хорошо? Я... я оставил свой меч где-то в саду. Я бы
          нашёл его сам, но мне не позволено покидать пост. Принеси мне меч и я
          выпущу тебя, лады?
        `
      });

      this.memory.charactersVisited.add(character);
    }
  }

  ["Item Given"](actor, target, item) {
    if (this.memory.questIsDone) return;
    
    if (target == this.character) {
      if (item.name.en.includes("sword")) {
        actor.owner.message("AI Message", this.character, {
          en: `
            *guard itches his head*

            That's not my sword... Okay, I will polish it and it will be as good
            as new. You have done your task. You may come through.
          `,
          ru: `
            *стражник чешет репу*

            Это не мой меч... Ай, ладно, протру его и будет как новенький.
            Ты выполнил свою задачу. Можешь проходить.
          `
        });

        let key = this.character.inventory.items.find((item) => item.name.en.includes("key"));
        this.execute("give", key, actor);
      }
    }
  }
}
