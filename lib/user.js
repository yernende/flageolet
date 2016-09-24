module.exports = class User {
  constructor(connection) {
    this.input = [];
    this.output = [];
    this.character = {};
    this.connection = connection;
  }

  handleInput() {
    if (this.input.length > 0) {
      let query = this.input.shift();
      this.output.push(query);
    }
  }

  handleOutput() {
    this.connection.write(this.output.join(""));
    this.output = [];
  }
};
