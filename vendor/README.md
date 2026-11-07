# vendor/userscript-pp

A copy of [Userscript++](https://github.com/0-V-linuxdo/UserscriptPP) (GPL-3.0-or-later), the
framework CC++ is built on since 0.4: `core/`, `scripts/`, `types/` and its docs, unchanged.
It is vendored rather than installed because the build has to work where only the npm registry is
reachable; its npm dependencies (`esbuild`, `preact`) are in CC++'s own `package.json`.

Pinned commit: `d4748153899083bd4dc20c093430efed4e992d31` (framework 0.1.0 + unreleased changes,
including the AdGuard / Tampermonkey / ScriptCat support).

To update, replace the folder with another commit of the framework and rebuild:

```sh
git clone https://github.com/0-V-linuxdo/UserscriptPP /tmp/uspp && git -C /tmp/uspp checkout <commit>
rm -rf vendor/userscript-pp && mkdir vendor/userscript-pp
cp -r /tmp/uspp/{core,scripts,types,package.json,LICENSE,CHANGELOG.md,README.md} vendor/userscript-pp/
bun run check
```

Then update the pinned commit above. Don't edit files in here; change the framework upstream.
