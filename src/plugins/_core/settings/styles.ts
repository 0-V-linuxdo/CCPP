/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { IMAGE_FIELD_CSS } from "./imageField";
import { STAR_COLOR } from "@lib/themeColor";

/** The CC++ pages (plugins, themes, Quick CSS). Mirrors claude.ai's settings panel and void++'s cards. */
export const PANEL_CSS = `
/* A page's toolbar (tabs, search, filters) stays at the top while its list scrolls under it. */
.page-body > .sticky-top { position: sticky; top: -4px; z-index: 2; margin: -4px calc(-1 * var(--cds-pad-xl, 24px)) 0; padding: 4px var(--cds-pad-xl, 24px) 0; background: var(--bg); }
.page { display: flex; flex-direction: column; min-height: 0; height: 100%; }
.page-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 0 var(--cds-pad-xl, 24px) 8px; }
.page-head h2 { margin: 0; flex: 1; font-size: var(--cds-font-size-heading, 18px); font-weight: 600; }
.page-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px var(--cds-pad-xl, 24px) 24px; scrollbar-gutter: stable; }

.bar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.search { position: relative; flex: 1; min-width: 0; }
.search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--fg3); pointer-events: none; }
.search .input { padding-left: 32px; }
.bar select.input { width: 7.5rem; flex: none; }

.tabs { display: flex; gap: 2px; overflow-x: auto; margin: 0 0 14px; border-bottom: 1px solid var(--line); scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tabs button { position: relative; flex: none; height: 34px; padding: 0 10px; border: 0; background: transparent; color: var(--fg3); font-size: var(--fs-sm); white-space: nowrap; }
.tabs button:hover { color: var(--fg); }
.tabs button.active { color: var(--fg); font-weight: 500; }
.tabs button.active::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--fg); }
.tabs .n { margin-left: 4px; color: var(--fg3); font-weight: 400; font-variant-numeric: tabular-nums; }

.banner { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 14px; border-radius: var(--radius-card); background: color-mix(in srgb, var(--warn) 14%, transparent); color: var(--fg); font-size: var(--fs-sm); }
.banner svg { color: var(--warn); flex: none; }
.banner span { flex: 1; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
.sep { display: flex; align-items: center; gap: 10px; margin: 18px 0 10px; color: var(--fg3); font-size: var(--fs-xs); }
.sep::before, .sep::after { content: ""; flex: 1; height: 1px; background: var(--line); }

.card { display: flex; flex-direction: column; min-width: 0; min-height: 7.5rem; padding: 12px; border-radius: .5rem; border: 1px solid var(--line); background: var(--bg-card, transparent); transition: border-color .12s, background .12s; }
.card:hover { border-color: color-mix(in srgb, var(--fg) 22%, transparent); }
.card.crashed { border-color: color-mix(in srgb, var(--bad) 60%, transparent); }
.card.crashed .card-body { opacity: .5; }
.card-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.chip-icon { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 6px; flex: none; background: color-mix(in srgb, var(--fg) 10%, transparent); color: var(--fg); }
.card.off .chip-icon { color: var(--fg3); }
.card-title { flex: 1; min-width: 0; font-size: .875rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.card-title:hover { text-decoration: underline; text-underline-offset: 2px; }
.card-actions { display: flex; align-items: center; gap: 0; flex: none; }
.card-actions .icon-btn { width: 26px; height: 26px; }
.icon-btn.star.on { color: ${STAR_COLOR}; } .icon-btn.star.on svg { fill: currentColor; }
.icon-btn.pin.on { color: var(--fg); } .icon-btn.pin.on svg { fill: currentColor; }
.card-actions .switch { margin-left: 6px; }
.card-desc { margin-top: 8px; font-size: .8125rem; line-height: 1.45; color: var(--fg2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-foot { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--line-soft); font-size: .7rem; color: var(--fg3); min-width: 0; }
.card-desc + .card-foot, .card-body > .card-foot { margin-top: auto; }
.card-gap { flex: 1; min-height: 8px; }
.card-foot .author { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-foot .badge { height: 16px; font-size: 10px; }

.empty { padding: 40px 16px; text-align: center; color: var(--fg3); }
.empty b { display: block; color: var(--fg2); font-weight: 500; margin-bottom: 4px; }

/* claude.ai settings rows */
.section { margin-bottom: 24px; }
.section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.section-head h3 { flex: 1; margin: 0; font-size: var(--fs); font-weight: 600; }
.section-head p { margin: 0; }
.rows > .row + .row { border-top: 1px solid var(--line-soft); }
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; }
.row.wide { flex-direction: column; align-items: stretch; gap: 8px; }
.row-text { min-width: 0; flex: 1; }
.row-title { color: var(--fg); }
.row-desc { color: var(--fg3); margin-top: 2px; font-size: var(--fs-sm); }
.row-control { flex: none; display: flex; align-items: center; gap: 8px; }
.row-control select.input { width: auto; min-width: 9rem; }
.row-control .range { display: flex; align-items: center; gap: 8px; } .row-control .range input { width: 160px; accent-color: var(--fg); }
.row-control output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.row-control input[type=color] { width: 40px; height: 28px; padding: 0; border: 0; border-radius: 6px; background: none; box-shadow: inset 0 0 0 1px var(--field-ring); }
.editor { width: 100%; min-height: 360px; }
.muted { color: var(--fg3); }
.hint { color: var(--fg3); font-size: var(--fs-sm); margin: 0 0 10px; }
${IMAGE_FIELD_CSS}`;

/** Our own dialogs: plugin settings, confirmations, theme editors, and the standalone shell. */
export const LAYER_CSS = `
.backdrop { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: auto; background: var(--cds-backdrop, rgba(0,0,0,.5)); animation: fade .15s ease-out; }
.backdrop.clear { background: transparent; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { from { opacity: 0; transform: scale(.98); } }
.dialog { position: relative; display: flex; flex-direction: column; width: min(560px, calc(100% - 32px)); max-height: calc(100% - 48px); border-radius: calc(var(--radius) + 8px); background: var(--bg); box-shadow: var(--shadow); overflow: hidden; animation: pop .15s ease-out; }
.dialog.small { width: min(420px, calc(100% - 32px)); }
.dialog.wide { width: min(760px, calc(100% - 32px)); }
.d-head { display: flex; align-items: center; gap: 10px; padding: 16px 16px 4px 20px; }
.d-head h2 { flex: 1; min-width: 0; margin: 0; font-size: var(--cds-font-size-heading, 17px); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.d-head .chip-icon { width: 1.75rem; height: 1.75rem; }
/* Dialog toolbar: between the title and the scrolling body, so it never scrolls away. */
.d-top { flex: none; padding: 4px 20px 0; }
.d-top + .d-body { padding-top: 0; }
.d-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 20px 16px; }
.d-desc { color: var(--fg2); margin: 0 0 6px; }
.d-meta { color: var(--fg3); font-size: var(--fs-xs); margin: 0 0 8px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.d-sep { height: 1px; background: var(--line); margin: 12px 0; }
.d-title { font-weight: 600; margin: 0 0 4px; }
.d-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid var(--line-soft); }
.d-foot .grow { flex: 1; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.field label { font-size: var(--fs-sm); color: var(--fg2); }
.btn.danger-solid { background: var(--bad); color: var(--cds-on-danger, #fff); } .btn.danger-solid:hover { opacity: .9; }

/* standalone shell, used when claude.ai's own settings dialog can't host CC++ */
.shell { position: relative; display: grid; grid-template-columns: 12rem 1fr; width: min(1024px, calc(100% - 32px)); height: min(50rem, calc(100% - 32px)); border-radius: calc(var(--radius) + 8px); background: var(--bg); box-shadow: var(--shadow); overflow: hidden; animation: pop .15s ease-out; }
.shell-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px; background: var(--bg-nav); border-right: 1px solid var(--line); }
.shell-nav .group { padding: 12px 8px 4px; font-size: var(--fs-xs); color: var(--fg3); }
.shell-nav button { display: flex; align-items: center; gap: 8px; height: var(--h); padding: 0 8px; border: 0; border-radius: var(--radius); background: transparent; color: var(--fg2); text-align: left; }
.shell-nav button:hover { background: var(--bg2); color: var(--fg); }
.shell-nav button.active { background: var(--bg3); color: var(--fg); font-weight: 500; }
.shell-nav .ver { font-size: var(--fs-xs); color: var(--fg3); font-variant-numeric: tabular-nums; }
.shell-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.shell-top { display: flex; justify-content: flex-end; padding: 12px 12px 0; }
@media (max-width: 640px) { .shell { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } .shell-nav { flex-direction: row; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--line); } .shell-nav .group { display: none; } }
`;
