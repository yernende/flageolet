/* global Terminal */
(async () => {
  const query = new URLSearchParams(location.search);
  if (query.get('export') === '1') document.body.classList.add('export');
  async function load(url, binary = false) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot load ${url}; run capture first.`);
    return binary ? new Uint8Array(await response.arrayBuffer()) : response.json();
  }
  const names = await load('/recordings.json');
  const name = query.get('scenario') || names[0];
  if (!names.includes(name)) throw new Error('No successful recording selected; run capture first.');
  for (const available of names) {
    const link = document.createElement('a');
    link.href = `?scenario=${available}`;
    link.textContent = available;
    document.querySelector('nav').append(link);
  }
  const metadata = await load(`/recordings/${name}/metadata.json`);
  const bytes = await load(`/recordings/${name}/frame.ansi`, true);
  document.title = `Flageolet · ${metadata.title}`;
  document.getElementById('subtitle').textContent = metadata.title;
  document.getElementById('source').textContent = `Captured from a live TCP session · Node.js ${metadata.node.replace(/^v/, '')}`;
  await Promise.all([
    document.fonts.load('400 16px "JetBrains Mono"', 'Алтарь ┌─┐│└┘'),
    document.fonts.load('700 16px "JetBrains Mono"', 'Flageolet')
  ]);
  await document.fonts.ready;
  const terminal = new Terminal({
    cols: 80, rows: metadata.rows, fontFamily: 'JetBrains Mono', fontSize: 16,
    lineHeight: metadata.lineHeight, letterSpacing: 0, disableStdin: true,
    cursorBlink: false, cursorInactiveStyle: 'none', allowTransparency: false, scrollback: 1000,
    theme: {
      background: '#101721', foreground: '#dbe4ef', cursor: '#101721', selectionBackground: '#334155',
      black: '#1c2533', red: '#ed6a6a', green: '#8fca94', yellow: '#e4c673', blue: '#82aaff',
      magenta: '#c099ff', cyan: '#80d8d8', white: '#dbe4ef', brightBlack: '#738197',
      brightRed: '#ff8a8a', brightGreen: '#aeecb3', brightYellow: '#ffdf95', brightBlue: '#a5c3ff',
      brightMagenta: '#d9b8ff', brightCyan: '#a7efef', brightWhite: '#ffffff'
    }
  });
  terminal.open(document.getElementById('terminal'));
  await new Promise(resolve => terminal.write(bytes, resolve));
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const buffer = terminal.buffer.active;
  const text = Array.from({length: terminal.rows}, (_, row) => buffer.getLine(buffer.viewportY + row)?.translateToString(true) || '').join('\n');
  const demo = document.querySelector('.demo').getBoundingClientRect();
  const screen = document.querySelector('.xterm-screen').getBoundingClientRect();
  const container = document.querySelector('.screen').getBoundingClientRect();
  window.demoResult = {
    text, scrolled: buffer.baseY > 0,
    clipped: demo.left < 0 || demo.top < 0 || demo.right > innerWidth || demo.bottom > innerHeight || screen.left < container.left || screen.right > container.right,
    fontsLoaded: [...document.fonts].length === 2 && [...document.fonts].every(font => font.status === 'loaded'),
    visibleText: metadata.visibleText
  };
  window.demoTerminal = terminal;
  document.body.dataset.ready = 'true';
})().catch(error => {
  window.demoError = error.message;
  const element = document.getElementById('error');
  element.textContent = error.message;
  element.hidden = false;
});
