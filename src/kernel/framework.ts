/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/*
 * CC++ plugins on Userscript++. Each entry under sites/claude/plugins/ is `toFramework(plugin)`: a
 * factory the framework calls with its instance `U`, returning a framework plugin definition that
 * drives the CC++ plugin. The framework owns the on/off switch (stored at
 * `U.Settings.plugins.<Name>.enabled`, exactly where CC++ keeps it), dependencies, start stages,
 * safe mode, error counts and diagnostics; CC++ keeps its Scope, settings coercion, restart on a
 * settings change, and its own settings UI.
 */

import { bindHost, type Host, host } from "./host";
import { t } from "./i18n";
import { enterPhase, type Plugin, registerOne, runStart, runStop, startEarly } from "./plugins";
import { getRaw, type Option, type Value } from "./settings";

let earlyQueued = false;

/** Framework setting definitions for the framework's own plugin dialog and backup checks. CC++'s settings UI uses CC++'s. */
function frameworkSettings(U: Host, plugin: Plugin) {
    const def = plugin.settings?.def;
    if (!def || !Object.keys(def).length) return undefined;
    const T = U.OptionType;
    const out: Record<string, unknown> = {};
    const checks: Record<string, unknown> = {};
    const describe = (option: Option) => {
        const label = t(option.label);
        const detail = option.description ? t(option.description) : "";
        return detail ? `${label}: ${detail}` : label;
    };
    for (const [key, option] of Object.entries(def)) {
        const base = { get description() { return describe(option); } };
        switch (option.type) {
            case "boolean":
                out[key] = { ...base, type: T.BOOLEAN, default: option.default };
                break;
            case "number":
                out[key] = { ...base, type: T.SLIDER, min: option.min, max: option.max, default: option.default, markers: [option.min, option.max] };
                break;
            case "select":
                out[key] = {
                    ...base,
                    type: T.SELECT,
                    get options() {
                        return option.options.map(o => ({ label: t(o.label), value: o.value, default: o.value === option.default }));
                    },
                };
                break;
            case "text":
                out[key] = { ...base, type: T.STRING, default: option.default, multiline: true, rows: option.rows ?? 4 };
                break;
            case "string":
            case "color":
                out[key] = { ...base, type: T.STRING, default: option.default };
                break;
            case "image":
                // A data: URL is too long for a text box; CC++'s settings UI has the picker.
                out[key] = { ...base, type: T.STRING, default: option.default, hidden: true };
                break;
            case "action":
                out[key] = {
                    ...base,
                    type: T.COMPONENT,
                    component: () =>
                        U.react.h(
                            U.components.Button as never,
                            {
                                size: "sm",
                                onClick: async () => {
                                    if (option.confirm && !(await U.components.confirmDialog({ title: t(option.confirm), danger: true }))) return;
                                    option.run();
                                },
                            },
                            t(option.button),
                        ),
                };
                break;
        }
        if (option.visible) {
            const visible = option.visible;
            checks[key] = {
                disabled: () => {
                    const values: Record<string, Value | undefined> = {};
                    for (const k of Object.keys(def)) values[k] = getRaw(plugin.name, k) ?? (def[k] as { default?: Value }).default;
                    return !visible(values);
                },
            };
        }
    }
    return U.definePluginSettings(out, checks);
}

/** The framework plugin that drives one CC++ plugin. */
export function toFramework(plugin: Plugin) {
    return (U: Host) => {
        bindHost(U);
        registerOne(plugin);
        // Every factory runs in the same task; the microtask after them sees the whole plugin list.
        if (!earlyQueued && host()) {
            earlyQueued = true;
            queueMicrotask(startEarly);
        }
        return {
            name: plugin.name,
            get description() {
                return t(plugin.description);
            },
            authors: plugin.authors?.length ? plugin.authors : ["CC++"],
            tags: [plugin.category, ...(plugin.tags ?? [])],
            enabledByDefault: !!plugin.enabledByDefault,
            required: !!plugin.required,
            hidden: !!plugin.hidden,
            dependencies: plugin.dependencies ?? [],
            startAt: plugin.startAt === "document-start" ? U.StartAt.Init : U.StartAt.DOMContentLoaded,
            requiresRestart: !!plugin.restartNeeded,
            updatedAt: plugin.updatedAt ? Date.parse(plugin.updatedAt) : undefined,
            settings: frameworkSettings(U, plugin),
            start() {
                enterPhase(plugin.startAt === "document-start" ? "document-start" : "dom-ready");
                // Already running when it started early (document-start plugins).
                runStart(plugin, true);
            },
            stop() {
                runStop(plugin);
            },
        };
    };
}
