module.exports = class Hookable {
  constructor() {
    this.flags = new Set();
  }

  static registerHook(rule, handler) {
    this.hooks.push({
      ruleParts: rule.split(":"),
      handler
    });
  }

  dispatchHook(rule, ...args) {
    let ruleParts = rule.split(":");

    for (let hook of this.constructor.hooks) {
      let ruleMatchesMiddleware = true;

      for (let [i, rulePart] of ruleParts.entries()) {
        if (hook.ruleParts[i] == rulePart) {
          continue;
        } else {
          ruleMatchesMiddleware = false;
          break;
        }
      }

      if (ruleMatchesMiddleware) {
        hook.handler.apply(this, args);
      }
    }
  }
}
