const fs = require('node:fs/promises');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {root, outputDirectory, selection} = require('./common');
const scenarios = require('./scenarios');
const {Session} = require('./session');
const {startServer} = require('./server');

async function captureScenario(name, {output = outputDirectory, signal, timeoutMs = 10000, scenario = scenarios[name]} = {}) {
  const directory = path.join(output, name);
  await fs.mkdir(directory, {recursive: true});
  // Invalidate old successful output before starting a new attempt.
  await Promise.all(['metadata.json', 'frame.ansi', 'server.ansi', 'session.ansi', scenario.filename].map(
    file => fs.rm(path.join(directory, file), {force: true})
  ));
  const logs = {stdout: '', stderr: ''};
  const metadata = {
    scenario: name, title: scenario.title, rows: scenario.rows, lineHeight: scenario.lineHeight,
    filename: scenario.filename, visibleText: scenario.visibleText,
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(),
    dirty: Boolean(execFileSync('git', ['status', '--porcelain'], {cwd: root, encoding: 'utf8'}).trim()),
    node: process.version, capturedAt: new Date().toISOString(), status: 'failed'
  };
  let server, session;
  try {
    server = await startServer({signal, logs});
    session = new Session(server.port, {signal, timeoutMs});
    await session.wait('Алтарь храма');
    for (const step of scenario.setup) await session.send(step);
    // Reuse the real prompt preceding the first captured command.
    const prompt = Buffer.concat(session.raw).subarray(-2);
    const start = session.transcript.length;
    for (const step of scenario.frame) await session.send(step);
    await fs.writeFile(path.join(directory, 'frame.ansi'), Buffer.concat([prompt, ...session.transcript.slice(start)]));
    metadata.status = 'success';
    console.log(`Captured ${name}: ${directory}`);
    return metadata;
  } catch (error) {
    metadata.error = error.stack || String(error);
    throw error;
  } finally {
    session?.close();
    await server?.stop();
    metadata.commands = session?.events || [];
    await Promise.all([
      fs.writeFile(path.join(directory, 'server.ansi'), Buffer.concat(session?.raw || [])),
      fs.writeFile(path.join(directory, 'session.ansi'), Buffer.concat(session?.transcript || [])),
      fs.writeFile(path.join(directory, 'server.stdout.log'), logs.stdout),
      fs.writeFile(path.join(directory, 'server.stderr.log'), logs.stderr),
      fs.writeFile(path.join(directory, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n')
    ]);
  }
}

if (require.main === module) {
  const controller = new AbortController();
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => controller.abort(new Error(`Capture interrupted by ${signal}`)));
  }
  (async () => {
    for (const name of selection()) await captureScenario(name, {signal: controller.signal});
  })().catch(error => { console.error(error); process.exitCode = 1; });
}

module.exports = {captureScenario};
