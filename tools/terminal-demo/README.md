# Terminal demo screenshots

An isolated documentation tool for Flageolet. Each capture starts the existing
server with `PORT=0` and a temporary copy of `areas` through `WORLD_DIR`, then
plays a fixed scenario using Node's TCP client. It does not connect to the public
demo or import engine internals. No changes to the engine or root dependencies
are required.

## Capture and preview locally

Use the Node version in the repository's `.node-version`. From the repository root:

```sh
npm ci --prefix tools/terminal-demo
npm --prefix tools/terminal-demo run capture
npm --prefix tools/terminal-demo run preview
```

Open the printed loopback URL yourself. Select **map** or **quest** in the preview.
Stop preview with Ctrl+C. Capture and preview do not launch a browser, install
Chromium, or require Python, `nc`, Docker, or a running game server.

`capture` defaults to both scenes. Choose one with `-- --scenario map` or
`-- --scenario quest`. Each scenario gets a fresh world and process; command
responses are awaited by their expected text and final prompt, with a ten-second
timeout. Failure or interruption closes the connection, stops the child and
removes the copied world. The original world is never edited.

## Export PNG in GitHub Actions

Open **Actions → Terminal screenshots → Run workflow**, choose the source branch
and `all`, `map`, or `quest`. Download the resulting artifact after completion.
It is retained for 30 days and includes 1280×720 PNGs, recordings and logs.

The manual workflow installs the pinned Chromium version through Playwright,
tests the tool, records sessions and renders them. It renders again from the
saved recordings and checks identical PNG hashes. It has read-only repository
permissions, uses no deployment secrets and does not commit images, create PRs,
or deploy the game. The existing deployment workflow still runs on ordinary
pushes to `master`, including commits that add this tool.

PNG export is also an explicit command on a machine where browser automation is
allowed and Chromium has been installed for this package:

```sh
npm --prefix tools/terminal-demo run render
# Or: npm --prefix tools/terminal-demo run render -- --scenario quest
```

Use Actions for rendering on this project's MacBook workflow; do not install or
run Playwright/Chromium there without the owner's explicit approval. Recording
and preview need no such browser automation.

## Artifacts and appearance

All output is under the ignored `artifacts/terminal-demo/` directory. Each scene
contains:

- `server.ansi`: unmodified bytes received from the server.
- `session.ansi`: the complete display transcript, including local echo of sent commands.
- `frame.ansi`: the selected display fragment, starting with the preceding server prompt.
- `metadata.json`: source commit, dirty-worktree flag, runtime, scenario, commands,
  frame settings and success/failure status.
- Server stdout/stderr logs and, after export, `terminal-demo.png` or `dialogue-demo.png`.

The shared xterm.js template preserves ANSI colors and cursor positioning, the
80-column terminal, dark frame and captions. Both font weights of JetBrains Mono
are bundled with their license. The caption identifies a local TCP session;
commands are displayed by the capture client as local echo. Game text is not
rewritten. Rendering reads only saved artifacts and works after the game exits.

Capture invalidates old successful output for the selected scene first. If it
fails, inspect the metadata, transcript and logs; do not use an older PNG as a
successful result. There are no automatic retries that could hide changed game
behavior. Use separate worktrees for concurrent captures.

## Scenarios and checks

`scenarios.js` defines setup commands, frame commands, expected reply text,
visible text checks and frame dimensions. **map** completes the guard quest and
follows the land path to the bridge; **quest** records the sword/key exchange.
Only these scenarios are exposed by the CLI and workflow in v1. When adding a
scene, update the scenario registry, CLI choices and workflow choices together.

```sh
npm --prefix tools/terminal-demo test
```

Tests use `node:test` and local TCP processes without browser automation. They
cover split UTF-8/ANSI, prompt completion, timeouts, disconnection, cancellation,
process cleanup, real scenarios, world immutability and preview routing. CI also
checks fonts, Cyrillic and box drawing, visible content, clipping and PNG size.

To update the project README images, review the downloaded PNGs against the
existing images, copy the selected ones into `docs/images`, and commit that
change separately. The tool never replaces those files automatically. Its
package, fonts and browser dependencies are excluded by the existing deployment
archive's runtime allowlist.
