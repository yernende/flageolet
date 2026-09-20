const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {root} = require('./common');

async function startServer({signal, timeoutMs = 10000, logs = {stdout: '', stderr: ''},
  entry = path.join(root, 'index.js'), worldSource = path.join(root, 'areas')} = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'flageolet-demo-'));
  let child, stopping;
  async function cleanup() {
    try {
      if (child && child.exitCode === null && child.signalCode === null && child.pid) {
        await new Promise(resolve => {
          const timer = setTimeout(() => child.kill('SIGKILL'), 2000);
          child.once('exit', () => { clearTimeout(timer); resolve(); });
          child.kill('SIGTERM');
        });
      }
    } finally {
      await fs.rm(directory, {recursive: true, force: true});
    }
  }
  const stop = () => stopping ||= cleanup();
  try {
    await fs.cp(worldSource, path.join(directory, 'world'), {recursive: true});
    signal?.throwIfAborted();
    child = spawn(process.execPath, [entry], {
      cwd: root, env: {...process.env, PORT: '0', WORLD_DIR: path.join(directory, 'world')},
      stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { logs.stdout += chunk; });
    child.stderr.on('data', chunk => { logs.stderr += chunk; });
    const port = await new Promise((resolve, reject) => {
      const finish = (error, value) => {
        clearTimeout(timer);
        child.stdout.off('data', check);
        child.off('exit', exited);
        child.off('error', failed);
        signal?.removeEventListener('abort', aborted);
        error ? reject(error) : resolve(value);
      };
      const check = () => {
        const match = /Flageolet listening on port (\d+)\./.exec(logs.stdout);
        if (match) finish(null, Number(match[1]));
      };
      const failed = error => finish(error);
      const exited = code => finish(new Error(`Server exited during startup (${code}): ${logs.stderr}`));
      const aborted = () => finish(signal.reason);
      const timer = setTimeout(() => finish(new Error('Timed out waiting for server startup')), timeoutMs);
      child.stdout.on('data', check);
      child.once('exit', exited);
      child.once('error', failed);
      signal?.addEventListener('abort', aborted, {once: true});
      if (signal?.aborted) aborted();
      else check();
    });
    return {port, child, directory, stop};
  } catch (error) {
    await stop();
    throw error;
  }
}

module.exports = {startServer};
