# AGENTS.md

Notes for AI agents working on CC++.

## Workflow

- Push straight to `main`; no pull requests. Run `git pull origin main` before pushing.
- Bump `version` in `package.json` for every release, so Violentmonkey picks up the update.
- Before pushing: `npx tsc --noEmit -p .`, `bun test`, `bun run build` (writes `userscript/CCPP.user.js`).
- Everything is a plugin. Each new plugin is written in its own thread/session.

## Testing in Helium

- Updating the CC++ userscript in Helium is the agent's job, done through the Helium DevTools MCP.
  Never ask the user to click Install or Update in Violentmonkey.
- After a release, tell whoever verifies in Helium the new version and what changed.
