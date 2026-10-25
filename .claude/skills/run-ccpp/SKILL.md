---
name: run-ccpp
description: Build the CC++ userscript, update it in the user's Helium browser through the Helium DevTools MCP (Violentmonkey), and check or screenshot it running on claude.ai. Use when asked to run, update, install, test, verify or screenshot CC++ / the userscript in Helium, or to "使用helium mcp 更新userscript".
---

# Run CC++ (build → update in Helium → verify on claude.ai)

CC++ is a userscript for claude.ai. There is no app to launch in this container:
it runs in the user's **Helium** browser under **Violentmonkey**, and the agent
reaches that browser only through the `mcp__Helium_DevTools__*` tools (load them
with `ToolSearch` query `helium`). The "driver" is the set of `evaluate_script`
functions below plus `raw-version.sh`. Paths are relative to the repo root.

Per `AGENTS.md`, Helium work belongs to the dedicated test thread ("Helium 统一测试");
development threads push a release and message that thread instead. Never ask
the user to click Install/Update in Violentmonkey.

## Build and test (container)

```bash
bun install --frozen-lockfile
bun test                 # 98 tests, 0 fail at 0.3.119
bun run build            # writes userscript/CCPP.user.js, prints the version
```

Release = bump `version` in `package.json`, build, commit `userscript/CCPP.user.js`,
push to `main`. Violentmonkey updates from `@updateURL`
(`raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js`), so only
what is on `main` can be installed this way; a branch build cannot.

## Update in Helium (agent path)

1. Wait for the CDN to serve the new build (it caches 300 s):
   ```bash
   .claude/skills/run-ccpp/raw-version.sh        # polls every 30 s, exit 0 when raw == local @version
   ```
2. `new_page` with `url: chrome-extension://jinjaccalgkegednnccohejagnlnfdag/options/index.html`,
   `background: true`. The tab is selected afterwards even though `list_pages` doesn't show it.
3. `evaluate_script` on it:
   ```js
   async () => {
     if (!location.href.startsWith("chrome-extension://jinjaccalgkegednnccohejagnlnfdag/")) return { wrongPage: location.href };
     const B = globalThis.browser || chrome;
     const find = d => d.scripts.find(x => x.meta.name === "CC++");
     const before = find(await B.runtime.sendMessage({ cmd: "GetData", data: {} }));
     B.runtime.sendMessage({ cmd: "CheckUpdate", data: before.props.id }); // never resolves: don't await
     await new Promise(r => setTimeout(r, 5000));
     const s = find(await B.runtime.sendMessage({ cmd: "GetData", data: {} }));
     return { id: s.props.id, before: before.meta.version, after: s.meta.version, lastUpdated: new Date(s.props.lastUpdated).toISOString(), href: location.href };
   }
   ```
   `after` should be the new `20261013.<version>`. Script id was 1293.
4. Reuse the same tab as the test tab: `navigate_page` `type: url`, `url: https://claude.ai/new`.
   Now it has a page id in the result (e.g. `94: https://claude.ai/new [selected]`).
5. `evaluate_script`:
   ```js
   async () => {
     if (!location.href.startsWith("https://claude.ai/")) return { wrongPage: location.href };
     for (let i = 0; i < 20 && !window.CCPP; i++) await new Promise(r => setTimeout(r, 500));
     return { href: location.href, version: window.CCPP?.version, plugins: window.CCPP && Object.keys(window.CCPP.plugins).length };
   }
   ```
   `version` is the bare `package.json` version (`0.3.119`, no date prefix).
6. `take_screenshot` with **no** `filePath` (inline). Look at it: the composer page should render normally (not a login or error page). Other userscripts also draw on this page, so the version from step 5 is the proof, not the picture.
7. `close_page` with that page id. Leave every other tab alone.

## Gotchas

- **`take_screenshot` with `filePath` writes on the user's Mac, not in this container.**
  Take it inline; the image lands under `~/.claude/projects/.../tool-results/*.jpg`, copy it from there if you need a file.
- **The Violentmonkey tab has no page id**, so `close_page` can't target it. Navigating it
  to claude.ai (step 4) gives it one; that's how you both test and clean up with one tab.
- **The selected page jumps after `close_page`** to some unrelated tab of the user's
  (an OAuth page in our run). Every script checks `location.href` first; keep that.
  Other agents share this browser too, so re-check right before every `evaluate_script`.
- `CheckUpdate`'s promise never settles; awaiting it hangs the MCP call until timeout.
- `CheckUpdate` on an already-current script is a silent no-op (`lastUpdated` unchanged),
  so "after == before" means either nothing new on `main` or the CDN still serves the old file: run `raw-version.sh`.
- `window.CCPP` and `window.__ccpp` both exist; `CCPP` has `version`, `plugins`, `plugin`.
- Sending messages on claude.ai during a test: switch the model to Haiku first (`AGENTS.md`).

## Troubleshooting

- `curl: (23) Failure writing output` when grepping the raw file: `grep -m1` closed the pipe; harmless. `raw-version.sh` uses a range request to avoid it.
- `raw-version.sh` prints `timed out: CDN still serves …`: the push hasn't reached `main` or the CDN; check `git log origin/main -1`, then rerun.
- `evaluate_script` returns `{ wrongPage: ... }`: another tab got selected; `select_page` your tab (or redo step 2) and rerun.
