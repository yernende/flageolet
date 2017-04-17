module.exports = [{
  pattern: "language <string:(en|ru)>",
  action(language) {
    this.language = language;
    this.message("Language Switched");
  }
}];
