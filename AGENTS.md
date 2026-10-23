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
- Helium's DevTools MCP is shared by every agent: the selected page can change between two calls.
  Open your own tab with `new_page`, re-select it right before each `evaluate_script`, check
  `location.href` inside the script, and close the tab when done.

### Updating the userscript through MCP

1. `new_page` (or `navigate_page`) to the Violentmonkey options page:
   `chrome-extension://jinjaccalgkegednnccohejagnlnfdag/options/index.html`.
   Extension pages are missing from `list_pages`, but right after navigating they are the selected page.
2. Run there (find the script id via `GetData`, `scripts[].meta.name === "CC++"`; it was 1293):
   ```js
   async () => {
     const B = globalThis.browser || chrome;
     B.runtime.sendMessage({ cmd: "CheckUpdate", data: 1293 }); // don't await: it never resolves
     await new Promise(r => setTimeout(r, 5000));
     const d = await B.runtime.sendMessage({ cmd: "GetData", data: {} });
     const s = d.scripts.find(x => x.props.id === 1293);
     return { ver: s.meta.version, lastUpdated: new Date(s.props.lastUpdated).toISOString() };
   }
   ```
3. Reload the claude.ai tab under test and check `window.__ccpp` for the version.
   raw.githubusercontent.com can lag a few minutes behind a push; retry if the version hasn't moved.
4. Close every Violentmonkey page the update opened (`close_page`) once the update is done, including any install or confirm tab it popped up. Don't leave it open or just send it to `about:blank`.
5. Once your Helium test is done, also close every claude.ai page you opened for it (`close_page`). Leave tabs you didn't open alone.
