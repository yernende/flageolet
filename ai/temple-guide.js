const AI = require("../src/ai");

module.exports = class TempleGuideAI extends AI {
  ["Talk"]({character}) {
    this.showMainMenu(character);
  }

  showMainMenu(character, message = {
    en: "Welcome, traveller. I tend this quiet temple.\nWhat would you like to know?",
    ru: "Приветствую, путник. Я забочусь об этом тихом храме.\nО чём ты хочешь узнать?"
  }) {
    this.dialog(character, message, [{
      en: "Tell me about the temple.",
      ru: "Расскажи о храме.",
      handler: () => {
        this.showMainMenu(character, {
          en: "This altar has welcomed travellers for generations.\nWe keep the gardens so that all may find a moment of peace.",
          ru: "Этот алтарь встречает путников уже много поколений.\nМы ухаживаем за садами, чтобы каждый мог найти здесь покой."
        });
      }
    }, {
      en: "Where can I go from here?",
      ru: "Куда можно пойти отсюда?",
      handler: () => this.showDirectionsMenu(character)
    }, {
      en: "Farewell.",
      ru: "До свидания.",
      handler: () => this.sayFarewell(character)
    }]);
  }

  showDirectionsMenu(character, message = {
    en: "Go north from the altar to reach the courtyard.\nThe gardens lie west and east; the gate is farther north.\nAsk the guard for the gate key to explore the forest beyond.",
    ru: "Иди на север от алтаря, чтобы попасть во двор.\nСады лежат к западу и востоку, а врата — дальше на север.\nПоговори со стражником о ключе, чтобы выйти в лес."
  }) {
    this.dialog(character, message, [{
      en: "Tell me about the gardens.",
      ru: "Расскажи о садах.",
      handler: () => {
        this.showDirectionsMenu(character, {
          en: "The western garden has ivy-covered walls and shaded benches.\nIn the eastern garden, cherry trees grow in the sunlight.\nBoth paths lead back to the courtyard.",
          ru: "В западном саду плющ оплетает стены, а скамьи стоят в тени.\nВ восточном саду под солнцем растут вишнёвые деревья.\nОбе тропы ведут обратно во двор."
        });
      }
    }, {
      en: "Back.",
      ru: "Назад.",
      handler: () => this.showMainMenu(character)
    }, {
      en: "Farewell.",
      ru: "До свидания.",
      handler: () => this.sayFarewell(character)
    }]);
  }

  sayFarewell(character) {
    this.tell(character, {
      en: "May you find a little peace in our gardens. Farewell.",
      ru: "Пусть наши сады подарят тебе немного покоя. До свидания."
    });
  }
};
