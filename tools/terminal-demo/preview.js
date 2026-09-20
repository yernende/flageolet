const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {outputDirectory} = require('./common');
const scenarios = require('./scenarios');

async function serve({output = outputDirectory, port = 0} = {}) {
  const files = new Map([
    ['/', ['web/index.html', 'text/html']],
    ['/app.js', ['web/app.js', 'text/javascript']],
    ['/style.css', ['web/style.css', 'text/css']],
    ['/xterm.js', ['node_modules/@xterm/xterm/lib/xterm.js', 'text/javascript']],
    ['/xterm.css', ['node_modules/@xterm/xterm/css/xterm.css', 'text/css']],
    ['/fonts/regular.woff2', ['fonts/JetBrainsMono-Regular.woff2', 'font/woff2']],
    ['/fonts/bold.woff2', ['fonts/JetBrainsMono-Bold.woff2', 'font/woff2']]
  ].map(([url, [file, type]]) => [url, [path.join(__dirname, file), type]]));
  for (const name of Object.keys(scenarios)) {
    for (const [file, type] of [['metadata.json', 'application/json'], ['frame.ansi', 'application/octet-stream']]) {
      files.set(`/recordings/${name}/${file}`, [path.join(output, name, file), type]);
    }
  }
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (request.method !== 'GET') { response.writeHead(405).end(); return; }
      if (pathname === '/recordings.json') {
        const available = [];
        for (const name of Object.keys(scenarios)) {
          try {
            const metadata = JSON.parse(await fs.readFile(path.join(output, name, 'metadata.json'), 'utf8'));
            if (metadata.status === 'success') available.push(name);
          } catch (error) { if (error.code !== 'ENOENT') throw error; }
        }
        response.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
        response.end(JSON.stringify(available));
        return;
      }
      const file = files.get(pathname);
      if (!file) { response.writeHead(404).end('Not found'); return; }
      const bytes = await fs.readFile(file[0]);
      response.writeHead(200, {'Content-Type': file[1], 'Cache-Control': 'no-store'});
      response.end(bytes);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, {'Content-Type': 'text/plain'});
      response.end(error.code === 'ENOENT' ? 'Run capture first.' : 'Could not load recording.');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    })
  };
}

if (require.main === module) {
  serve().then(server => {
    console.log(`Open ${server.url} in your browser. Ctrl+C stops the preview.`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
  }).catch(error => { console.error(error); process.exitCode = 1; });
}

module.exports = {serve};
