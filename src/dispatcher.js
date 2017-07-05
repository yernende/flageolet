module.exports = class Dispatcher {
  constructor() {
    this.flags = new Set();
  }

  static use(rule, handler) {
    this.middlewares.push({
      ruleParts: rule.split(":"),
      handler
    });
  }

  dispatch(rule, ...args) {
    let ruleParts = rule.split(":");

    for (let middleware of this.constructor.middlewares) {
      let ruleMatchesMiddleware = true;

      for (let [i, rulePart] of ruleParts.entries()) {
        if (middleware.ruleParts[i] == rulePart) {
          continue;
        } else {
          ruleMatchesMiddleware = false;
          break;
        }
      }

      if (ruleMatchesMiddleware) {
        middleware.handler.apply(this, args);
      }
    }
  }
}
