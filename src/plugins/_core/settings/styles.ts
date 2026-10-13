/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

export const DIALOG_CSS = `
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); pointer-events: auto; display: grid; place-items: center; animation: fade .15s ease-out; }
@keyframes fade { from { opacity: 0; } }
.dialog { width: min(920px, calc(100vw - 32px)); height: min(720px, calc(100vh - 48px)); display: grid; grid-template-columns: 180px 1fr; border-radius: 16px; overflow: hidden; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); }
@media (max-width: 640px) { .dialog { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } .nav { flex-direction: row; overflow-x: auto; border-right: 0 !important; border-bottom: 1px solid var(--line); } .nav .brand { display: none; } }
.nav { display: flex; flex-direction: column; gap: 2px; padding: 14px 10px; background: var(--bg2); border-right: 1px solid var(--line); }
.brand { display: flex; align-items: baseline; gap: 6px; padding: 2px 8px 12px; }
.brand b { font-size: 17px; letter-spacing: .2px; } .brand span { font-size: 11px; color: var(--fg3); }
.tab { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 10px; border-radius: 8px; border: 0; background: transparent; text-align: left; white-space: nowrap; color: var(--fg2); }
.tab:hover { background: var(--bg3); color: var(--fg); } .tab.active { background: var(--bg); color: var(--fg); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.head { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.head h2 { margin: 0; font-size: 15px; flex: 1; }
.content { flex: 1; overflow: auto; padding: 14px; }
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
.search { position: relative; flex: 1; min-width: 180px; } .search svg { position: absolute; left: 9px; top: 7px; color: var(--fg3); } .search .input { padding-left: 30px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.chip { height: 26px; padding: 0 10px; border-radius: 13px; border: 1px solid var(--line); background: transparent; color: var(--fg2); font-size: 12px; }
.chip:hover { background: var(--bg2); } .chip.active { background: var(--fg); color: var(--bg); border-color: transparent; }
.chip .n { opacity: .6; margin-left: 4px; }
.banner { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 12px; border-radius: 10px; background: color-mix(in srgb, var(--warn) 16%, transparent); }
.banner span { flex: 1; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
.card { display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); min-width: 0; }
.card.open { grid-column: 1 / -1; }
.card.off { background: var(--bg2); }
.card-top { display: flex; align-items: center; gap: 8px; }
.card-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--bg3); color: var(--fg2); flex: none; }
.card.on .card-icon { color: var(--accent); }
.card-title { flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-desc { color: var(--fg2); font-size: 12.5px; }
.card-meta { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.card-actions { display: flex; gap: 0; }
.card-actions .icon-btn { width: 24px; height: 24px; }
.err { font-size: 12px; color: var(--bad); }
.options { display: flex; flex-direction: column; gap: 12px; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--line); }
.opt { display: grid; grid-template-columns: 1fr auto; gap: 4px 16px; align-items: center; }
.opt.wide { grid-template-columns: 1fr; }
.opt-label { font-weight: 500; } .opt-desc { grid-column: 1 / -1; color: var(--fg3); font-size: 12px; }
.opt select.input { width: auto; min-width: 140px; }
.opt .range { display: flex; align-items: center; gap: 8px; } .opt .range input { width: 160px; accent-color: var(--accent); } .opt .range output { min-width: 48px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.opt input[type=color] { width: 40px; height: 28px; padding: 0; border: 1px solid var(--line); border-radius: 6px; background: none; }
.opt-foot { display: flex; justify-content: flex-end; }
.empty { padding: 40px; text-align: center; color: var(--fg3); }
.section { margin-bottom: 18px; } .section h3 { font-size: 13px; margin: 0 0 8px; } .section p { margin: 0 0 8px; color: var(--fg2); }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
kbd { font: 11px ui-monospace, monospace; padding: 1px 5px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg2); }
`;
