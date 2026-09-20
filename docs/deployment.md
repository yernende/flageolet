# Demo deployment

The public game uses raw TCP: `nc flashalet.irln.ru 4000`. The requested hostname must point to `88.218.62.136`; until its DNS is updated, use `nc 88.218.62.136 4000`. It does not serve HTTP or require an HTTPS certificate. Sessions start in Russian; enter `language en` to switch.

`.github/workflows/deploy.yml` runs the engine and deployment tests on pull requests, pushes to `master`, and manual workflow runs. A successful run packages the dependency-free Node.js server and starting world as a checked artifact. Only `master` can deploy, and repository variable `DEPLOY_ENABLED` must be `true`. Forks have deployment disabled by default.

The deployment job uses the `production` environment, limited to the `master` branch. It needs these environment secrets:

- `DEPLOY_SSH_TARGET`: the dedicated deployment account and host.
- `DEPLOY_SSH_KEY`: its dedicated Ed25519 private key.
- `DEPLOY_KNOWN_HOSTS`: the server's verified SSH host key.

Environment variables `DEPLOY_PUBLIC_HOST` and `DEPLOY_PUBLIC_PORT` select the external TCP health check. The host can be an IP while DNS changes propagate. The application expects Node.js 24.15.0, pinned in `.node-version`. No runtime dependency installation is needed.

GitHub-hosted runners send the tested archive over host-pinned SSH. The server validates it, activates the release, restarts only the game service and checks the initial room over TCP. Actions also tests the public endpoint. Deployments are serialized; superseded commits are skipped before activation. A failed server activation restores the previous release and world.

**Every deployment disconnects current players and resets the world to the committed definitions.** Ordinary process restarts reset NPCs, items, quest progress and doors, while retaining any saved room edits until the next deployment. There are no accounts or persistent player inventories. Every player can use the editor. Graceful reload is future work.

To release, push a tested commit to `master`. To retry, run **CI and deploy** manually from `master`. To roll code back, revert the relevant application commit and push; this also resets the demo world. Server installation, restricted SSH access, systemd configuration, manual rollback and credential rotation are maintained in the owner's private Personal Infrastructure repository. No server keys or private operational state belong in this repository.
