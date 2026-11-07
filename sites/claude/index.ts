/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/*
 * The claude.ai site for Userscript++. The framework calls this factory first, then every plugin
 * factory under ./plugins (each one wraps a CC++ plugin from src/plugins, see src/kernel/framework.ts).
 */

import { bindHost, type Host, host } from "@kernel/host";
import { Logger } from "@kernel/logger";
import { allPlugins, pluginInfo, startPhase } from "@kernel/plugins";
import { migrateLegacy, SETTINGS_UI_PLUGIN } from "@kernel/settings";
import { isDark, pageWindow } from "@lib/page";
import { installTooltips } from "@lib/tooltip";
import { isSettingsOpen, openSettings } from "@core/settings";
import { setVersion, version } from "@core/settings/state";

const logger = new Logger("Kernel");

/** A read-only `window.CCPP` that lists plugin state, for checking an install from the console. */
function exposeRuntime(U: Host) {
    const win = pageWindow as unknown as Record<string, unknown>;
    win.__ccpp = version;
    const runtime = Object.freeze({
        version,
        scriptVersion: U.version,
        framework: U.frameworkVersion,
        get plugins() {
            return allPlugins().map(pluginInfo);
        },
        plugin(name: string) {
            const found = allPlugins().find(p => p.name === name);
            return found ? pluginInfo(found) : null;
        },
    });
    try {
        Object.defineProperty(win, "CCPP", { value: runtime, enumerable: false, configurable: false, writable: false });
    } catch {}
}

const settingsUiRunning = () => !!allPlugins().find(p => p.name === SETTINGS_UI_PLUGIN)?.scope;

export default (U: Host) => {
    bindHost(U);
    // Without a bound host this is the build reading the site's metadata in Node: no side effects.
    let migrated = false;
    if (host()) {
        setVersion(U.version);
        migrated = migrateLegacy();
        exposeRuntime(U);
        installTooltips();
    }

    return U.defineSite({
        id: "claude",
        name: "Claude",
        matches: ["https://claude.ai/*"],
        theme: () => (isDark() ? "dark" : "light"),
        // "CC++ settings" anywhere in the framework (its search bar, U.openSettings) opens CC++'s own settings.
        // In safe mode CC++'s settings UI doesn't run and the framework panel opens instead.
        settingsHost: {
            open(opts: { tab?: string; plugin?: string } = {}) {
                if (!settingsUiRunning()) return false;
                void openSettings(opts);
                return true;
            },
            isOpen: () => isSettingsOpen(),
        },
        start() {
            startPhase("dom-ready");
            // 0.3 settings copied before the framework could save: save them now.
            if (migrated) U.SettingsStore.markAsChanged();
            if (!U.isSafeMode()) {
                // CC++ has its own script-manager menu entry (with its shortcut) and, for managers without
                // a menu such as AdGuard, the account-menu entry; the framework's duplicates go.
                U.removeSlotItem("menuCommand", "uspp-settings");
                U.removeSlotItem("floating", "uspp.settingsEntry");
            }
            logger.info(`CC++ ${version} on Userscript++ ${U.frameworkVersion}, ${allPlugins().length} plugins`);
        },
    });
};
