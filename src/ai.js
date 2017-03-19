const EventEmitter = require("events");

module.exports = class AI extends EventEmitter {
  constructor() {
    super();
    this.memory = {};
  }

  message(name, ...args) {
    this.emit(name, ...args);
  }
}
