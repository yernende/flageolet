const net = require("net");

const server = net.createServer((connection) => {
  connection.pipe(connection);
}).listen(4000);
