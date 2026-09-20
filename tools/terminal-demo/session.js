const net = require('node:net');
const {EventEmitter} = require('node:events');
const {stripVTControlCharacters} = require('node:util');

class Session extends EventEmitter {
  constructor(port, {timeoutMs = 10000, signal} = {}) {
    super();
    this.timeoutMs = timeoutMs;
    this.signal = signal;
    this.raw = [];
    this.transcript = [];
    this.events = [];
    this.failure = null;
    this.socket = net.createConnection({host: '127.0.0.1', port});
    this.socket.on('data', chunk => {
      this.raw.push(chunk);
      this.transcript.push(chunk);
      this.emit('progress');
    });
    this.socket.on('error', error => { this.failure = error; this.emit('progress'); });
    this.socket.on('close', () => {
      this.failure ||= new Error('TCP connection closed before the expected response');
      this.emit('progress');
    });
  }

  wait(expect, offset = 0) {
    return new Promise((resolve, reject) => {
      const finish = (error, result) => {
        clearTimeout(timer);
        this.off('progress', check);
        this.signal?.removeEventListener('abort', abort);
        error ? reject(error) : resolve(result);
      };
      const abort = () => finish(this.signal.reason);
      const check = () => {
        // Decode the accumulated bytes, not individual TCP chunks: both UTF-8
        // characters and ANSI escape sequences can straddle packet boundaries.
        const bytes = Buffer.concat(this.raw).subarray(offset);
        const plain = stripVTControlCharacters(bytes.toString('utf8'));
        if (plain.includes(expect) && plain.endsWith('> ')) return finish(null, bytes);
        if (this.failure) finish(this.failure);
      };
      const timer = setTimeout(() => finish(new Error(`Timed out waiting for ${JSON.stringify(expect)} and prompt`)), this.timeoutMs);
      this.on('progress', check);
      this.signal?.addEventListener('abort', abort, {once: true});
      if (this.signal?.aborted) abort();
      else check();
    });
  }

  async send({command, expect}) {
    this.signal?.throwIfAborted();
    const offset = Buffer.concat(this.raw).length;
    this.events.push({command, expect});
    // TCP itself has no input echo. Record exactly what our client sends,
    // presented with the same local echo a terminal client would display.
    this.transcript.push(Buffer.from(command + '\r\n'));
    const response = this.wait(expect, offset);
    this.socket.write(command + '\n');
    return response;
  }

  close() { this.socket.destroy(); }
}

module.exports = {Session};
