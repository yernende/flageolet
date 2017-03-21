module.exports = class AI {
  constructor() {
    this.memory = {};
  }

  message(name, ...args) {
    if (this[name]) {
      this[name](...args);
    }
  }
}
