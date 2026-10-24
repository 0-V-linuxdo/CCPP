// ==UserScript==
// @name         CC++
// @namespace    https://github.com/0-V-linuxdo/CCPP
// @version      20261013.0.3.99
// @description  Everything-is-a-plugin enhancements for claude.ai: usage meter, chat outline, starred messages, prompt history, notifications and more.
// @author       CC++ Contributors
// @homepageURL  https://github.com/0-V-linuxdo/CCPP
// @supportURL   https://github.com/0-V-linuxdo/CCPP/issues
// @downloadURL  https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js
// @updateURL    https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js
// @match        https://claude.ai/*
// @run-at       document-start
// @inject-into  page
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
  // src/kernel/logger.ts
  var STYLE = "background:#d97757;color:#fff;border-radius:3px;padding:0 4px";

  class Logger {
    name;
    static TAG = "CC++";
    constructor(name) {
      this.name = name;
    }
    out(level, args) {
      console[level](`%c${Logger.TAG}%c ${this.name}`, STYLE, "", ...args);
    }
    debug = (...args) => this.out("debug", args);
    info = (...args) => this.out("info", args);
    warn = (...args) => this.out("warn", args);
    error = (...args) => this.out("error", args);
  }

  // src/kernel/events.ts
  var logger = new Logger("Events");
  var handlers = new Map;
  function on(name, handler) {
    let set = handlers.get(name);
    if (!set)
      handlers.set(name, set = new Set);
    set.add(handler);
    return () => void set.delete(handler);
  }
  function emit(name, payload) {
    for (const handler of [...handlers.get(name) ?? []]) {
      try {
        handler(payload);
      } catch (error) {
        logger.error(`Handler for ${String(name)} failed:`, error);
      }
    }
  }

  // src/kernel/scope.ts
  var logger2 = new Logger("Scope");

  class Scope {
    cleanups = [];
    controller = new AbortController;
    get signal() {
      return this.controller.signal;
    }
    get alive() {
      return !this.controller.signal.aborted;
    }
    defer(fn) {
      if (this.alive)
        this.cleanups.push(fn);
      else
        fn();
      return fn;
    }
    listen(target, type, fn, options = {}) {
      target.addEventListener(type, fn, { ...options, signal: this.signal });
    }
    on(name, handler) {
      this.defer(on(name, handler));
    }
    timeout(fn, ms) {
      const id = setTimeout(() => this.alive && fn(), ms);
      this.defer(() => clearTimeout(id));
      return id;
    }
    interval(fn, ms) {
      const id = setInterval(() => this.alive && fn(), ms);
      this.defer(() => clearInterval(id));
      return id;
    }
    mount(node, parent = document.body ?? document.documentElement) {
      parent.appendChild(node);
      this.defer(() => node.remove?.());
      return node;
    }
    observe(target, options, fn) {
      const observer = new MutationObserver(fn);
      observer.observe(target, options);
      this.defer(() => observer.disconnect());
      return observer;
    }
    child() {
      const scope = new Scope;
      const remove = this.defer(() => scope.dispose());
      scope.defer(() => {
        const i = this.cleanups.indexOf(remove);
        if (i >= 0)
          this.cleanups.splice(i, 1);
      });
      return scope;
    }
    dispose() {
      if (!this.alive)
        return;
      this.controller.abort();
      for (const fn of this.cleanups.splice(0).reverse()) {
        try {
          fn();
        } catch (error) {
          logger2.error("Cleanup failed:", error);
        }
      }
    }
  }

  // src/kernel/storage.ts
  var PREFIX = "ccpp:";
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  function removeKey(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  }
  function dumpAll() {
    const out = {};
    try {
      for (let i = 0;i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX))
          out[key.slice(PREFIX.length)] = localStorage.getItem(key) ?? "";
      }
    } catch {}
    return out;
  }
  function persisted(key, fallback, valid) {
    const listeners = new Set;
    const load = () => {
      const value = readJson(key, fallback);
      return valid(value) ? value : fallback;
    };
    let value = load();
    const store = {
      get: () => value,
      set(next) {
        value = next;
        writeJson(key, next);
        for (const listener of [...listeners])
          listener(next);
      },
      reload() {
        value = load();
        for (const listener of [...listeners])
          listener(value);
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => void listeners.delete(listener);
      }
    };
    try {
      globalThis.addEventListener?.("storage", (event) => {
        if (event.key === PREFIX + key || event.key === null)
          store.reload();
      });
    } catch {}
    return store;
  }

  // src/kernel/settings.ts
  var logger3 = new Logger("Settings");
  var SETTINGS_KEY = "settings";
  var listeners = new Set;
  var isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
  var bag = (() => {
    const stored = readJson(SETTINGS_KEY, {});
    return isRecord(stored) ? stored : {};
  })();
  function announce(plugin, key) {
    for (const listener of [...listeners]) {
      try {
        listener(plugin, key);
      } catch (error) {
        logger3.error("Settings listener failed:", error);
      }
    }
  }
  var getRaw = (plugin, key) => bag[plugin]?.[key];
  function setRaw(plugin, key, value) {
    if (bag[plugin]?.[key] === value)
      return;
    bag = { ...bag, [plugin]: { ...bag[plugin], [key]: value } };
    if (!writeJson(SETTINGS_KEY, bag))
      logger3.warn("Settings could not be saved");
    announce(plugin, key);
  }
  function resetRaw(plugin, keys) {
    const current = bag[plugin];
    if (!current)
      return;
    const changed = keys.filter((key) => (key in current));
    if (!changed.length)
      return;
    const next = { ...current };
    for (const key of changed)
      delete next[key];
    bag = { ...bag, [plugin]: next };
    writeJson(SETTINGS_KEY, bag);
    for (const key of changed)
      announce(plugin, key);
  }
  function onSettingsChange(listener) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  }
  function diffBags(before, after) {
    const out = [];
    for (const plugin of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const a = isRecord(before[plugin]) ? before[plugin] : {};
      const b = isRecord(after[plugin]) ? after[plugin] : {};
      const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => a[key] !== b[key]);
      keys.sort((x, y) => Number(y === "enabled") - Number(x === "enabled"));
      for (const key of keys)
        out.push([plugin, key]);
    }
    return out;
  }
  function replaceBag(next) {
    const parsed = isRecord(next) ? next : {};
    const changed = diffBags(bag, parsed);
    bag = parsed;
    writeJson(SETTINGS_KEY, bag);
    for (const [plugin, key] of changed)
      announce(plugin, key);
  }
  function coerce(option, value) {
    switch (option.type) {
      case "action":
        return;
      case "boolean":
        return typeof value === "boolean" ? value : option.default;
      case "number": {
        if (typeof value !== "number" || !Number.isFinite(value))
          return option.default;
        const step = option.step ?? 1;
        const stepped = Math.round(value / step) * step;
        return Math.min(option.max, Math.max(option.min, Number(stepped.toFixed(6))));
      }
      case "select":
        return typeof value === "string" && option.options.some((o) => o.value === value) ? value : option.default;
      case "color":
        return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : option.default;
      case "string":
        return typeof value === "string" ? value.slice(0, option.maxLength ?? 2000) : option.default;
      case "text":
        return typeof value === "string" ? value : option.default;
      case "image":
        return typeof value === "string" && isImageUrl(value) ? value : option.default;
    }
  }
  function isImageUrl(value) {
    const v = value.trim();
    if (!v || v.startsWith("data:image/"))
      return true;
    try {
      return /^https?:$/.test(new URL(v).protocol);
    } catch {
      return false;
    }
  }
  function definePluginSettings(def) {
    let owner = "";
    const store = new Proxy({}, {
      get: (_, key) => def[key] ? coerce(def[key], getRaw(owner, key)) : undefined,
      set: (_, key, value) => {
        setRaw(owner, key, value);
        return true;
      }
    });
    return {
      def,
      store,
      bind: (plugin) => void (owner = plugin),
      owner: () => owner,
      reset: () => resetRaw(owner, Object.keys(def))
    };
  }

  // src/kernel/plugins.ts
  var logger4 = new Logger("Plugins");
  var definePlugin = (def) => ({ ...def, scope: null });
  var plugins = new Map;
  var allPlugins = () => [...plugins.values()];
  var getPlugin = (name) => plugins.get(name);
  var errors = new Map;
  var errorListeners = new Set;
  var pluginError = (name) => errors.get(name) ?? null;
  function onPluginStateChange(listener) {
    errorListeners.add(listener);
    return () => void errorListeners.delete(listener);
  }
  function notify(name) {
    for (const listener of [...errorListeners]) {
      try {
        listener(name);
      } catch {}
    }
  }
  function fail(plugin, stage, error) {
    logger4.error(`${plugin.name} failed (${stage}):`, error);
    const message = error instanceof Error ? error.message || error.name : String(error);
    errors.set(plugin.name, { stage, message: message.slice(0, 300), at: Date.now() });
  }
  function isEnabled(plugin) {
    if (plugin.required)
      return true;
    const value = getRaw(plugin.name, "enabled");
    return typeof value === "boolean" ? value : !!plugin.enabledByDefault;
  }
  var setEnabled = (plugin, enabled) => setRaw(plugin.name, "enabled", enabled);
  var dependentsOf = (name) => allPlugins().filter((p) => p.dependencies?.includes(name));
  function isActive(plugin, seen = new Set) {
    if (isEnabled(plugin))
      return true;
    if (seen.has(plugin.name))
      return false;
    seen.add(plugin.name);
    return dependentsOf(plugin.name).some((p) => isActive(p, seen));
  }
  var activeDependents = (name) => dependentsOf(name).filter((p) => isActive(p));
  var pluginInfo = (plugin) => ({
    name: plugin.name,
    category: plugin.category,
    enabled: isEnabled(plugin),
    active: isActive(plugin),
    running: !!plugin.scope,
    required: !!plugin.required,
    hidden: !!plugin.hidden,
    dependencies: [...plugin.dependencies ?? []],
    error: pluginError(plugin.name)
  });
  var bootActive = new Map;
  function registerPlugins(list) {
    for (const plugin of list) {
      if (plugins.has(plugin.name))
        throw new Error(`Duplicate plugin ${plugin.name}`);
      plugins.set(plugin.name, plugin);
    }
    for (const plugin of list) {
      for (const dep of plugin.dependencies ?? []) {
        if (!plugins.has(dep))
          throw new Error(`${plugin.name} depends on unknown plugin ${dep}`);
      }
      plugin.settings?.bind(plugin.name);
    }
    const cycle = findCycle();
    if (cycle)
      throw new Error(`Dependency cycle: ${cycle.join(" → ")}`);
    for (const plugin of list)
      bootActive.set(plugin.name, isActive(plugin));
    trackSeen();
  }
  function findCycle() {
    const state = new Map;
    const stack = [];
    const visit = (name) => {
      if (state.get(name) === 2)
        return null;
      if (state.get(name) === 1)
        return [...stack.slice(stack.indexOf(name)), name];
      state.set(name, 1);
      stack.push(name);
      for (const dep of plugins.get(name)?.dependencies ?? []) {
        const found = visit(dep);
        if (found)
          return found;
      }
      stack.pop();
      state.set(name, 2);
      return null;
    };
    for (const name of plugins.keys()) {
      const found = visit(name);
      if (found)
        return found;
    }
    return null;
  }
  var pendingRestart = () => allPlugins().filter((p) => p.restartNeeded && bootActive.get(p.name) !== isActive(p));
  var SEEN_KEY = "plugins-seen";
  var NEW_FOR_MS = 3 * 24 * 3600 * 1000;
  var RECENT_FOR_MS = 7 * 24 * 3600 * 1000;
  var seen = {};
  function trackSeen(now = Date.now()) {
    const stored = readJson(SEEN_KEY, null);
    const first = !stored || typeof stored !== "object";
    seen = first ? {} : { ...stored };
    let changed = first;
    for (const name of plugins.keys()) {
      if (typeof seen[name] === "number")
        continue;
      seen[name] = first ? 0 : now;
      changed = true;
    }
    if (changed)
      writeJson(SEEN_KEY, seen);
  }
  var isNew = (name, now = Date.now()) => (seen[name] ?? 0) > 0 && now - seen[name] < NEW_FOR_MS;
  function isRecent(plugin, now = Date.now()) {
    if (isNew(plugin.name, now))
      return true;
    const at = plugin.updatedAt ? Date.parse(plugin.updatedAt) : NaN;
    return Number.isFinite(at) && now >= at && now - at < RECENT_FOR_MS;
  }
  var phase = null;
  var phaseReached = (plugin) => phase === "dom-ready" || phase === "document-start" && plugin.startAt === "document-start";
  function startOne(plugin, chain = []) {
    if (plugin.scope)
      return true;
    for (const dep of plugin.dependencies ?? []) {
      const depPlugin = plugins.get(dep);
      if (!startOne(depPlugin, [...chain, plugin.name])) {
        fail(plugin, "start", new Error(`Dependency ${dep} did not start`));
        notify(plugin.name);
        return false;
      }
    }
    const scope = new Scope;
    try {
      plugin.start(scope);
      plugin.scope = scope;
      errors.delete(plugin.name);
      notify(plugin.name);
      return true;
    } catch (error) {
      scope.dispose();
      fail(plugin, "start", error);
      notify(plugin.name);
      return false;
    }
  }
  function stopOne(plugin) {
    if (!plugin.scope)
      return;
    for (const dependent of dependentsOf(plugin.name))
      stopOne(dependent);
    const scope = plugin.scope;
    plugin.scope = null;
    try {
      plugin.stop?.();
    } catch (error) {
      fail(plugin, "stop", error);
    }
    scope.dispose();
    notify(plugin.name);
  }
  function restartPlugin(plugin) {
    if (!plugin.scope)
      return;
    const running = dependentsOf(plugin.name).filter((p) => p.scope);
    stopOne(plugin);
    startOne(plugin);
    for (const dependent of running)
      startOne(dependent);
  }
  function reconcile() {
    if (!phase)
      return;
    for (const plugin of plugins.values())
      if (plugin.scope && !isActive(plugin))
        stopOne(plugin);
    for (const plugin of plugins.values())
      if (!plugin.scope && isActive(plugin) && phaseReached(plugin) && !errors.has(plugin.name))
        startOne(plugin);
  }
  function startPhase(next) {
    phase = next;
    reconcile();
    if (next === "dom-ready")
      scheduleRetries();
  }
  var RETRY_DELAYS_MS = [1500, 4000, 1e4];
  function scheduleRetries() {
    for (const delay of RETRY_DELAYS_MS)
      setTimeout(retryFailed, delay);
  }
  function retryFailed() {
    for (const plugin of plugins.values()) {
      if (plugin.scope || !isActive(plugin) || errors.get(plugin.name)?.stage !== "start")
        continue;
      errors.delete(plugin.name);
      startOne(plugin);
    }
  }
  onSettingsChange((name, key) => {
    if (key === "enabled") {
      const plugin = plugins.get(name);
      if (plugin)
        errors.delete(plugin.name);
      reconcile();
      return;
    }
    const plugin = plugins.get(name);
    if (!plugin?.scope || !plugin.settings?.def[key])
      return;
    if (!plugin.onSettingsChange) {
      restartPlugin(plugin);
      return;
    }
    try {
      plugin.onSettingsChange(key, plugin.scope);
    } catch (error) {
      fail(plugin, "settings", error);
      notify(plugin.name);
    }
  });

  // src/lib/page.ts
  var pageWindow = typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window;
  var isClaudeHost = (host = location.hostname) => host === "claude.ai";
  function isTopDocument() {
    if (!isClaudeHost())
      return false;
    try {
      return window.top === window.self;
    } catch {
      return false;
    }
  }
  var isDark = () => document.documentElement.dataset.mode === "dark" || !document.documentElement.dataset.mode && matchMedia?.("(prefers-color-scheme: dark)").matches;

  // src/lib/dom.ts
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false)
        continue;
      if (key.startsWith("on") && typeof value === "function")
        el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === "style" && typeof value === "object")
        Object.assign(el.style, value);
      else if (key === "class")
        el.className = String(value);
      else if (key === "text")
        el.textContent = String(value);
      else if (key in el && typeof value !== "string" && key !== "role")
        el[key] = value;
      else
        el.setAttribute(key, value === true ? "" : String(value));
    }
    append(el, children);
    return el;
  }
  function append(parent, children) {
    for (const child of children) {
      if (child == null || child === false)
        continue;
      parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
    }
  }
  var clear = (el) => {
    while (el.firstChild)
      el.firstChild.remove();
  };
  function isShown(el) {
    if (!el || !el.isConnected)
      return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  }
  function download(filename, content, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
    const a = h("a", { href: url, download: filename, style: { display: "none" } });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  var fileSafe = (name) => name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) || "untitled";
  var isEditable = (el) => {
    if (!(el instanceof HTMLElement))
      return false;
    return el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
  };

  // src/lib/tooltip.ts
  var TIP = "data-ccpp-tip";
  var TIP_DETAIL = "data-ccpp-tip-detail";
  var tipAttrs = (title, detail) => detail ? { [TIP]: title, [TIP_DETAIL]: detail } : { [TIP]: title };
  var card = null;
  var current = null;
  var showTimer;
  var lastHidden = 0;
  function ensureCard() {
    if (card?.isConnected)
      return card;
    card = h("div", {
      role: "tooltip",
      "data-ccpp-tooltip": "",
      style: {
        position: "fixed",
        zIndex: "2147483601",
        pointerEvents: "none",
        display: "none",
        flexDirection: "column",
        gap: "2px",
        maxWidth: "240px",
        padding: "6px 8px",
        borderRadius: "calc(0.375rem * var(--cds-rem-scale, 1))",
        background: "var(--cds-tooltip-bg, rgb(32,32,31))",
        color: "var(--cds-tooltip-fg, rgb(240,239,236))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1), 0 1px 2px rgba(11,11,11,.06), 0 2px 8px rgba(0,0,0,.24)",
        font: "400 calc(0.8125rem * var(--cds-rem-scale, 1))/calc(1.125rem * var(--cds-rem-scale, 1)) var(--cds-font-sans, ui-sans-serif, system-ui, sans-serif)",
        textWrap: "balance",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        textAlign: "start"
      }
    });
    document.body.appendChild(card);
    return card;
  }
  function showTip(anchor, title, detail = "") {
    if (!title)
      return hideTip();
    const el = ensureCard();
    el.replaceChildren(h("span", { text: title }), ...detail ? [h("span", { text: detail, style: { fontSize: "calc(0.6875rem * var(--cds-rem-scale, 1))", lineHeight: "calc(0.875rem * var(--cds-rem-scale, 1))", color: "rgb(195,194,183)" } })] : []);
    el.style.display = "flex";
    const a = anchor.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    el.style.left = `${Math.min(Math.max(8, a.left + a.width / 2 - r.width / 2), window.innerWidth - r.width - 8)}px`;
    el.style.top = `${a.top - r.height - 4 >= 8 ? a.top - r.height - 4 : a.bottom + 4}px`;
    current = anchor;
  }
  function hideTip() {
    clearTimeout(showTimer);
    if (card && card.style.display !== "none")
      lastHidden = Date.now();
    if (card)
      card.style.display = "none";
    current = null;
  }
  var tipTarget = (event) => event.composedPath().find((n) => n instanceof Element && n.hasAttribute(TIP)) ?? null;
  var installed = false;
  function installTooltips() {
    if (installed)
      return;
    installed = true;
    document.addEventListener("pointerover", (event) => {
      const target = tipTarget(event);
      if (target === current)
        return;
      clearTimeout(showTimer);
      if (!target)
        return hideTip();
      const open = () => target.isConnected && showTip(target, target.getAttribute(TIP) ?? "", target.getAttribute(TIP_DETAIL) ?? "");
      if (current || Date.now() - lastHidden < 400)
        open();
      else
        showTimer = setTimeout(open, 500);
    }, true);
    document.addEventListener("pointerout", (event) => !event.relatedTarget && hideTip(), true);
    for (const type of ["pointerdown", "keydown", "scroll", "blur"])
      window.addEventListener(type, hideTip, true);
    setInterval(() => current && !current.isConnected && hideTip(), 500);
  }

  // src/plugins/_api/claude/index.ts
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var orgPromise = null;

  class ApiError extends Error {
    status;
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  async function getJson(path, signal) {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: { accept: "application/json" } });
    if (!response.ok)
      throw new ApiError(response.status, `${response.status} ${path.replace(/[0-9a-f-]{36}/gi, ":id")}`);
    return await response.json();
  }
  function orgFromCookie(cookie = document.cookie) {
    const match = /(?:^|;\s*)lastActiveOrg=([^;]+)/.exec(cookie);
    const value = match ? decodeURIComponent(match[1]) : "";
    return UUID_RE.test(value) ? value.toLowerCase() : null;
  }
  function getOrgId() {
    const fromCookie = orgFromCookie();
    if (fromCookie)
      return Promise.resolve(fromCookie);
    orgPromise ??= getJson("/api/organizations").then((orgs) => {
      const chat = orgs.find((o) => o.capabilities?.includes("chat")) ?? orgs[0];
      if (!chat || !UUID_RE.test(chat.uuid))
        throw new Error("No organization");
      return chat.uuid;
    });
    orgPromise.catch(() => orgPromise = null);
    return orgPromise;
  }
  function parseWindow(raw) {
    if (!raw || typeof raw !== "object")
      return null;
    const { utilization, resets_at } = raw;
    const value = typeof utilization === "string" ? Number(utilization) : utilization;
    if (typeof value !== "number" || !Number.isFinite(value))
      return null;
    const reset = typeof resets_at === "string" ? Date.parse(resets_at) : NaN;
    return { utilization: Math.min(100, Math.max(0, value)), resetsAt: Number.isFinite(reset) ? reset : null };
  }
  var EXTRA_KEYS = { seven_day_opus: "Opus", seven_day_sonnet: "Sonnet" };
  function parseUsage(raw, now = Date.now()) {
    const data = raw && typeof raw === "object" ? raw : {};
    const extra = [];
    for (const [key, label] of Object.entries(EXTRA_KEYS)) {
      const window2 = parseWindow(data[key]);
      if (window2)
        extra.push({ key: label, window: window2 });
    }
    return { fiveHour: parseWindow(data.five_hour), sevenDay: parseWindow(data.seven_day), extra, fetchedAt: now };
  }
  async function getUsage(signal) {
    const org = await getOrgId();
    return parseUsage(await getJson(`/api/organizations/${org}/usage`, signal));
  }
  function messageText(raw) {
    if (Array.isArray(raw.content)) {
      const parts = raw.content.filter((part) => part && part.type === "text" && typeof part.text === "string").map((part) => part.text);
      if (parts.length)
        return parts.join(`

`);
    }
    return typeof raw.text === "string" ? raw.text : "";
  }
  function parseConversation(raw) {
    const data = raw && typeof raw === "object" ? raw : {};
    const list = (Array.isArray(data.chat_messages) ? data.chat_messages : []).map((m) => ({
      uuid: String(m.uuid ?? ""),
      parent: typeof m.parent_message_uuid === "string" ? m.parent_message_uuid : null,
      role: m.sender === "human" ? "user" : "assistant",
      text: messageText(m),
      createdAt: typeof m.created_at === "string" ? Date.parse(m.created_at) || null : null
    }));
    const byId = new Map(list.map((m) => [m.uuid, m]));
    let messages = list;
    const leaf = typeof data.current_leaf_message_uuid === "string" ? byId.get(data.current_leaf_message_uuid) : undefined;
    if (leaf) {
      const branch = [];
      const seen = new Set;
      for (let m = leaf;m && !seen.has(m.uuid); m = m.parent ? byId.get(m.parent) : undefined) {
        seen.add(m.uuid);
        branch.push(m);
      }
      messages = branch.reverse();
    }
    const date = (value) => typeof value === "string" ? Date.parse(value) || null : null;
    return {
      uuid: String(data.uuid ?? ""),
      name: typeof data.name === "string" ? data.name : "",
      model: typeof data.model === "string" ? data.model : null,
      createdAt: date(data.created_at),
      updatedAt: date(data.updated_at),
      messages
    };
  }
  async function getConversation(chatId, signal) {
    if (!UUID_RE.test(chatId))
      throw new Error("Bad chat id");
    const org = await getOrgId();
    return parseConversation(await getJson(`/api/organizations/${org}/chat_conversations/${chatId}?tree=True&rendering_mode=messages&render_all_tools=true`, signal));
  }
  var CODE_HEADERS = { accept: "application/json", "anthropic-version": "2023-06-01" };
  async function getCodeJson(path, signal) {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: CODE_HEADERS });
    if (!response.ok)
      throw new ApiError(response.status, `${response.status} ${path.replace(/(chan|cse|cmsg)_[A-Za-z0-9]+/g, "$1_…")}`);
    return await response.json();
  }
  function parseChannelMessages(raw) {
    const list = raw?.data;
    if (!Array.isArray(list))
      return [];
    const out = [];
    for (const m of list) {
      if (!m || typeof m !== "object" || typeof m.body !== "string")
        continue;
      const body = m.body.trim();
      if (!body)
        continue;
      const base = { id: String(m.id ?? ""), role: m.author_account_id ? "user" : "assistant", at: Date.parse(m.created_at) || 0 };
      if (body.startsWith("{")) {
        let card = null;
        try {
          card = JSON.parse(body);
        } catch {}
        if (card && typeof card === "object") {
          if ((card.kind ?? card.type) !== "message_routed")
            out.push({ ...base, role: "assistant", text: "", notice: true });
          continue;
        }
      }
      out.push({ ...base, text: body });
    }
    return out.sort((a, b) => a.at - b.at);
  }
  var channelCache = new Map;
  function getChannelMessages(channelId, threadId, force = false) {
    if (!/^chan_[A-Za-z0-9]+$/.test(channelId) || threadId && !/^cmsg_[A-Za-z0-9]+$/.test(threadId))
      return Promise.reject(new Error("Bad id"));
    const key = `${channelId}|${threadId ?? ""}`;
    const cached = channelCache.get(key);
    if (!force && cached && Date.now() - cached.at < 15000)
      return cached.value;
    const path = threadId ? `/v1/code/channels/${channelId}/threads/${threadId}?limit=200&include_draft=true` : `/v1/code/channels/${channelId}/timeline?limit=200&include_draft=true`;
    const value = getCodeJson(path).then(parseChannelMessages);
    value.catch(() => channelCache.delete(key));
    channelCache.set(key, { at: Date.now(), value });
    return value;
  }
  var CHANNEL_RE = /^chan_[A-Za-z0-9]+$/;
  var SESSION_RE = /^cse_[A-Za-z0-9]+$/;
  function normalizeBucket(value) {
    if (typeof value !== "string")
      return "";
    return value.replace(/^SESSION_STATUS_BUCKET_/, "").toLowerCase();
  }
  function parseActivity(channelId, raw) {
    const data = raw && typeof raw === "object" && Array.isArray(raw.data) ? raw.data : [];
    const activity = { channelId, working: 0, blocked: 0 };
    for (const message of data) {
      for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
        if (session?.status === "archived")
          continue;
        const bucket = normalizeBucket(session?.status_bucket);
        if (bucket === "working")
          activity.working++;
        else if (bucket === "blocked")
          activity.blocked++;
      }
    }
    return activity;
  }
  function parseSessionState(raw) {
    const root = raw && typeof raw === "object" ? raw : {};
    const session = root.response_shape && typeof root.response_shape === "object" ? root.response_shape : root;
    const status = session.session_status ?? session.status;
    if (status === "archived" || status === "deleted")
      return null;
    if (status === "requires_action" || session.worker_status === "requires_action")
      return "blocked";
    if (status === "pending" || status === "running" && session.worker_status !== "idle" || session.worker_status === "running")
      return "working";
    const bucket = normalizeBucket(session.status_bucket);
    if (bucket === "working")
      return "working";
    if (bucket === "blocked" || bucket === "failed")
      return "blocked";
    return null;
  }
  var channelSessions = null;
  var CHANNEL_LIST_TTL = 5 * 60000;
  function parseChannelSessions(raw) {
    const map = new Map;
    const data = raw && typeof raw === "object" && Array.isArray(raw.data) ? raw.data : [];
    for (const channel of data) {
      const session = channel?.channel_session_id ?? channel?.overview_session_id;
      if (typeof channel?.id === "string" && typeof session === "string" && SESSION_RE.test(session))
        map.set(channel.id, session);
    }
    return map;
  }
  function getChannelSessions(signal) {
    if (channelSessions && Date.now() - channelSessions.at < CHANNEL_LIST_TTL)
      return channelSessions.map;
    const map = getCodeJson("/v1/code/channels?scope=joined&include_archived=false&limit=200", signal).then(parseChannelSessions);
    const entry = { at: Date.now(), map };
    channelSessions = entry;
    map.catch(() => channelSessions === entry && (channelSessions = null));
    return map;
  }
  function phaseOf(session) {
    if (!session || session.status === "archived" || session.status === "deleted")
      return "idle";
    const bucket = normalizeBucket(session.status_bucket);
    if (bucket === "failed")
      return "failed";
    if (session.session_status !== undefined || session.worker_status !== undefined) {
      const state = parseSessionState(session);
      if (state)
        return state;
    }
    return bucket === "working" ? "working" : bucket === "blocked" ? "blocked" : "idle";
  }
  function parseCodePhase(raw) {
    const root = raw && typeof raw === "object" ? raw : {};
    return phaseOf(root.response_shape && typeof root.response_shape === "object" ? root.response_shape : root);
  }
  function threadPhasesFrom(raw) {
    const phases = new Map;
    const data = raw && typeof raw === "object" && Array.isArray(raw.data) ? raw.data : [];
    for (const message of data) {
      for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
        if (typeof session?.id === "string" && SESSION_RE.test(session.id))
          phases.set(session.id, phaseOf(session));
      }
    }
    return phases;
  }
  async function getProjectPhases(channelId, signal) {
    if (!CHANNEL_RE.test(channelId))
      throw new Error("Bad project id");
    const [timeline, sessions] = await Promise.all([
      getCodeJson(`/v1/code/channels/${channelId}/timeline?limit=200&bound_only=true`, signal),
      getChannelSessions(signal).catch(() => new Map)
    ]);
    const phases = threadPhasesFrom(timeline);
    const own = sessions.get(channelId);
    if (own) {
      try {
        phases.set(own, parseCodePhase(await getCodeJson(`/v1/code/sessions/${own}`, signal)));
      } catch {}
    }
    return phases;
  }
  async function getProjectActivity(channelId, signal) {
    if (!CHANNEL_RE.test(channelId))
      throw new Error("Bad project id");
    const [timeline, sessions] = await Promise.all([
      getCodeJson(`/v1/code/channels/${channelId}/timeline?limit=200&bound_only=true`, signal),
      getChannelSessions(signal).catch(() => new Map)
    ]);
    const activity = parseActivity(channelId, timeline);
    const own = sessions.get(channelId);
    activity.own = null;
    if (own) {
      try {
        activity.own = parseSessionState(await getCodeJson(`/v1/code/sessions/${own}`, signal));
      } catch {}
    }
    return activity;
  }
  var claude_default = definePlugin({
    name: "ClaudeApi",
    title: { zh: "claude.ai 接口", en: "claude.ai API" },
    description: {
      zh: "只读调用 claude.ai 同源接口（用量、对话内容），沿用浏览器登录态，不读取或保存 Cookie / token。",
      en: "Read-only calls to claude.ai's same-origin API (usage, conversations) with the browser's session. Never reads or stores cookies or tokens."
    },
    category: "api",
    icon: "shield",
    hidden: true,
    startAt: "document-start",
    start() {}
  });

  // src/plugins/_api/network/index.ts
  var logger5 = new Logger("NetworkApi");
  var responseHooks = new Set;
  var errorHooks = new Set;
  var blockers = new Set;
  function describe(input, init) {
    try {
      const raw = input instanceof Request ? input.url : String(input);
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      return { url: new URL(raw, location.href), method };
    } catch {
      return null;
    }
  }
  function onResponse(scope, match, handle) {
    const hook = { match, handle };
    responseHooks.add(hook);
    scope.defer(() => responseHooks.delete(hook));
  }
  function onRequestError(scope, match, handle) {
    const hook = { match, handle };
    errorHooks.add(hook);
    scope.defer(() => errorHooks.delete(hook));
  }
  var matching = (hooks, req) => [...hooks].filter((hook) => {
    try {
      return hook.match(req);
    } catch {
      return false;
    }
  });
  function block(scope, match) {
    blockers.add(match);
    scope.defer(() => blockers.delete(match));
  }
  var isBlocked = (req) => [...blockers].some((match) => {
    try {
      return match(req);
    } catch {
      return false;
    }
  });
  var sameOrigin = (req) => req.url.origin === location.origin;
  var network_default = definePlugin({
    name: "NetworkApi",
    title: { zh: "网络观察", en: "Network API" },
    description: {
      zh: "包装 fetch / sendBeacon：插件可以旁路读取响应副本，或拦截指定请求。不修改 claude.ai 拿到的原响应。",
      en: "Wraps fetch / sendBeacon so plugins can read response copies or block requests. claude.ai's own responses are never altered."
    },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const original = pageWindow.fetch;
      const wrapped = function fetch2(input, init) {
        const req = describe(input, init);
        if (req && blockers.size && isBlocked(req))
          return Promise.resolve(new Response(null, { status: 204 }));
        const promise = original.call(this ?? pageWindow, input, init);
        if (req && (responseHooks.size || errorHooks.size)) {
          const hooks = matching(responseHooks, req);
          const failed = matching(errorHooks, req);
          if (hooks.length || failed.length) {
            promise.then((response) => {
              for (const hook of hooks) {
                try {
                  hook.handle(response.clone(), req);
                } catch (error) {
                  logger5.error("Response hook failed:", error);
                }
              }
            }, (reason) => {
              for (const hook of failed) {
                try {
                  hook.handle(reason, req);
                } catch (error) {
                  logger5.error("Request error hook failed:", error);
                }
              }
            });
          }
        }
        return promise;
      };
      pageWindow.fetch = wrapped;
      scope.defer(() => {
        if (pageWindow.fetch === wrapped)
          pageWindow.fetch = original;
      });
      const beacon = pageWindow.navigator.sendBeacon?.bind(pageWindow.navigator);
      if (beacon) {
        const wrappedBeacon = (url, data) => {
          const req = describe(url, { method: "POST" });
          if (req && isBlocked(req))
            return true;
          return beacon(url, data);
        };
        pageWindow.navigator.sendBeacon = wrappedBeacon;
        scope.defer(() => {
          if (pageWindow.navigator.sendBeacon === wrappedBeacon)
            pageWindow.navigator.sendBeacon = beacon;
        });
      }
    }
  });

  // src/plugins/_api/router/index.ts
  var UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  var CHAT_RE = new RegExp(`^/chat/(${UUID})`, "i");
  var PROJECT_RE = new RegExp(`^/project/(${UUID})`, "i");
  function parseRoute(path) {
    const chat = CHAT_RE.exec(path);
    const project = PROJECT_RE.exec(path);
    const kind = chat ? "chat" : project ? "project" : path === "/new" || path === "/" ? "new" : path.startsWith("/settings") ? "settings" : "other";
    return { path, kind, chatId: chat?.[1].toLowerCase() ?? null, projectId: project?.[1].toLowerCase() ?? null };
  }
  var current2 = parseRoute(location.pathname);
  var currentRoute = () => current2;
  var search = location.search;
  function check() {
    const path = location.pathname;
    if (location.search !== search) {
      const previous = search;
      search = location.search;
      if (path === current2.path)
        emit("route:search", { search, previous });
    }
    if (path === current2.path)
      return;
    const previous = current2;
    current2 = parseRoute(path);
    emit("route", { route: current2, previous });
  }
  function onRoute(scope, fn, immediate = true) {
    scope.on("route", ({ route, previous }) => fn(route, previous));
    if (immediate)
      fn(current2, null);
  }
  var router_default = definePlugin({
    name: "RouterApi",
    title: { zh: "路由", en: "Router API" },
    description: { zh: "感知 claude.ai 单页应用里的页面切换（新对话、对话、项目……）。", en: "Tells plugins when claude.ai navigates between pages (new chat, chat, project…)." },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const history2 = pageWindow.history;
      const originals = { pushState: history2.pushState, replaceState: history2.replaceState };
      for (const key of ["pushState", "replaceState"]) {
        const original = originals[key];
        const patched = function(...args) {
          const result = original.apply(this, args);
          queueMicrotask(check);
          return result;
        };
        history2[key] = patched;
        scope.defer(() => {
          if (history2[key] === patched)
            history2[key] = original;
        });
      }
      scope.listen(pageWindow, "popstate", check);
      scope.interval(check, 700);
      current2 = parseRoute(location.pathname);
    }
  });

  // src/plugins/_api/dom/selectors.ts
  var SEL = {
    sidebar: '[data-testid="sidebar"]',
    sidebarRecents: '[data-testid="sidebar-recents"]',
    sidebarChatLink: 'a[href^="/chat/"]',
    modeCode: '[role="radiogroup"] [role="radio"][data-mode="code"]',
    userMenuButton: '[data-testid="user-menu-button"]',
    userMenuName: '[data-testid="user-menu-button"] .df-user-menu-trailing',
    avatar: '[data-cds="Avatar"]',
    accountMenu: '[role="menu"]:has([data-testid="user-menu-settings"])',
    chatHeader: '[data-testid="chat-header"]',
    headerActions: "#dframe-header-actions-slot",
    shareButton: '[data-testid="wiggle-controls-actions-share"]',
    transcript: '[data-testid="transcript-list"]',
    transcriptFeed: '[role="feed"][aria-label]',
    transcriptRow: '[data-testid="transcript-row"]',
    scroller: '[data-autoscroll-container="true"]',
    userMessage: ':is([data-testid="user-message"], [data-cds="UserMessage"])',
    userMessageBody: ".cds-user-message-body",
    assistantMessage: '[data-testid="assistant-message"]',
    streaming: '[data-testid="assistant-message"][data-is-streaming="true"]',
    messageActions: '[data-testid="message-actions"]',
    messageTime: 'time[data-cds="RelativeTime"]',
    prose: '[data-cds="Prose"]',
    composer: '[data-cds="ChatComposer"]',
    composerCard: "[data-composer-card-holder]",
    editor: ':is([data-testid="chat-input"], [data-testid="code-prompt-input"])',
    composerPlaceholder: "[data-composer-placeholder]",
    sendButton: ':is([data-testid="chat-input-send"], [data-testid="code-prompt-send"])',
    modelSelector: ':is([data-testid="model-selector-dropdown"], [data-testid="epitaxy-cds-model-selector"], [data-testid="environment-row-model"])',
    greeting: "[data-new-page-greeting-text]",
    greetingSpark: ':is([data-new-page-greeting-spark], svg[data-cds="Spark"])',
    menu: '[role="menu"]',
    menuItem: '[role="menuitem"]',
    jumpToLatest: '[data-testid="jump-to-latest"]'
  };

  // src/plugins/_api/dom/index.ts
  var logger6 = new Logger("DomApi");
  var watchers = new Set;
  var observer = null;
  var pending = null;
  var FLUSH_MS = 60;
  function runCleanup(cleanup) {
    try {
      cleanup?.();
    } catch (error) {
      logger6.error("Watcher cleanup failed:", error);
    }
  }
  function flushWatcher(watcher) {
    let found;
    try {
      found = new Set(document.querySelectorAll(watcher.selector));
    } catch (error) {
      logger6.error(`Watcher selector ${watcher.selector} failed:`, error);
      return;
    }
    for (const [el, cleanup] of watcher.live) {
      if (found.has(el) && el.isConnected)
        continue;
      watcher.live.delete(el);
      runCleanup(cleanup);
    }
    for (const el of found) {
      if (watcher.live.has(el))
        continue;
      try {
        watcher.live.set(el, watcher.onAdd(el));
      } catch (error) {
        watcher.live.set(el, undefined);
        logger6.error(`Watcher for ${watcher.selector} failed:`, error);
      }
    }
  }
  function flush() {
    pending = null;
    for (const watcher of [...watchers])
      flushWatcher(watcher);
  }
  var schedule = () => {
    pending ??= setTimeout(flush, FLUSH_MS);
  };
  function watch(scope, selector, onAdd) {
    const watcher = { selector, onAdd, live: new Map };
    watchers.add(watcher);
    flushWatcher(watcher);
    scope.defer(() => {
      watchers.delete(watcher);
      for (const cleanup of watcher.live.values())
        runCleanup(cleanup);
      watcher.live.clear();
    });
  }
  function onDomChange(scope, fn) {
    let timer = null;
    const run = () => {
      timer = null;
      if (scope.alive)
        fn();
    };
    const observer = new MutationObserver(() => timer ??= setTimeout(run, FLUSH_MS));
    observer.observe(document, { childList: true, subtree: true });
    scope.defer(() => {
      observer.disconnect();
      if (timer)
        clearTimeout(timer);
    });
    fn();
  }
  var dom_default = definePlugin({
    name: "DomApi",
    title: { zh: "DOM 观察", en: "DOM API" },
    description: { zh: "一个共享的 MutationObserver，供其它插件监听 claude.ai 元素的出现与消失。", en: "One shared MutationObserver that tells plugins when claude.ai elements appear and leave." },
    category: "api",
    icon: "code",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      const mine = new MutationObserver(schedule);
      observer = mine;
      mine.observe(document, { childList: true, subtree: true });
      scope.defer(() => {
        mine.disconnect();
        if (observer !== mine)
          return;
        observer = null;
        if (pending)
          clearTimeout(pending);
        pending = null;
      });
    }
  });

  // src/plugins/_api/chatState/index.ts
  function channelSendOf(path) {
    return /^\/v1\/code\/channels\/(chan_[A-Za-z0-9]+)\/messages$/.exec(path)?.[1] ?? null;
  }
  var SEND_RETRY_GRACE_MS = 6000;
  var phase2 = "idle";
  var startedAt = 0;
  var quietTicks = 0;
  var chatPhase = () => phase2;
  var STATUS_PREFIX = /^(?:[\p{Extended_Pictographic}\p{So}\uFE0F\u200D]+\s+)+/u;
  var PLACEHOLDER = /^(?:claude|new chat|untitled)$/i;
  function titleFrom(raw) {
    const title = raw.replace(STATUS_PREFIX, "").replace(/\s*[-–|]\s*Claude(?:\s+Code)?\s*$/i, "").trim();
    return PLACEHOLDER.test(title) ? "" : title;
  }
  var chatTitle = () => titleFrom(document.title);
  var QUIET_TICKS = 2;
  var CHECK_MS = 400;
  function tick(streamingNow, now = Date.now()) {
    const base = { chatId: currentRoute().chatId, title: chatTitle(), at: now };
    if (streamingNow) {
      quietTicks = 0;
      if (phase2 === "idle") {
        phase2 = "streaming";
        startedAt = now;
        emit("reply:start", base);
      }
      return;
    }
    if (phase2 !== "streaming")
      return;
    quietTicks++;
    if (quietTicks < QUIET_TICKS)
      return;
    phase2 = "idle";
    quietTicks = 0;
    emit("reply:end", { ...base, durationMs: now - startedAt });
  }
  var chatState_default = definePlugin({
    name: "ChatStateApi",
    title: { zh: "回复状态", en: "Reply state API" },
    description: { zh: "判断 Claude 是否正在回复，并在开始 / 结束、项目页消息发送失败时通知其它插件（后台标签页也有效）。", en: "Knows when Claude starts and finishes replying, and when a project message couldn't be sent, also in background tabs." },
    category: "api",
    icon: "sparkles",
    hidden: true,
    dependencies: ["NetworkApi", "RouterApi"],
    start(scope) {
      phase2 = "idle";
      quietTicks = 0;
      scope.interval(() => tick(!!document.querySelector(SEL.streaming)), CHECK_MS);
      let attempt = 0;
      let timer;
      const isSend = (req) => sameOrigin(req) && req.method === "POST" && !!channelSendOf(req.url.pathname);
      const failed = (req) => {
        const mine = attempt;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (scope.alive && mine === attempt)
            emit("send:failed", { channelId: channelSendOf(req.url.pathname), at: Date.now() });
        }, SEND_RETRY_GRACE_MS);
      };
      const counted = (req) => {
        if (!isSend(req))
          return false;
        attempt++;
        clearTimeout(timer);
        return true;
      };
      onResponse(scope, counted, (response, req) => {
        if (!response.ok)
          return failed(req);
        clearTimeout(timer);
        emit("send:ok", { channelId: channelSendOf(req.url.pathname), at: Date.now() });
      });
      onRequestError(scope, isSend, (_, req) => failed(req));
      scope.defer(() => clearTimeout(timer));
      scope.on("route", () => {
        phase2 = "idle";
        quietTicks = 0;
      });
    }
  });

  // src/plugins/_api/composer/index.ts
  function getEditor() {
    const all = [...document.querySelectorAll(SEL.editor)];
    return all.find((el) => el === document.activeElement) ?? all.find(isShown) ?? null;
  }
  function getText(editor = getEditor()) {
    if (!editor || editor.dataset.docEmpty === "true")
      return "";
    const blocks = [...editor.children];
    if (!blocks.length)
      return editor.innerText.trim();
    return blocks.map((block) => block.innerText.replace(/\n$/, "")).join(`
`).replace(/ /g, " ").trim();
  }
  function selectAll(editor) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  function insertText(text, editor = getEditor()) {
    if (!editor)
      return false;
    editor.focus();
    const data = new DataTransfer;
    data.setData("text/plain", text);
    const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true });
    editor.dispatchEvent(event);
    if (!event.defaultPrevented)
      document.execCommand("insertText", false, text);
    return true;
  }
  function setText(text, editor = getEditor()) {
    if (!editor)
      return false;
    selectAll(editor);
    if (!text) {
      document.execCommand("delete");
      return true;
    }
    if (!text.includes(`
`)) {
      if (document.execCommand("insertText", false, text))
        return true;
    }
    document.execCommand("delete");
    requestAnimationFrame(() => setTimeout(() => insertText(text, editor), 30));
    return true;
  }
  function onSubmit(scope, fn) {
    scope.listen(document, "keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229)
        return;
      const target = event.target;
      if (!target?.closest?.(SEL.editor))
        return;
      const editor = target.closest(SEL.editor);
      const text = getText(editor);
      if (text)
        fn(text, editor);
    }, { capture: true });
    scope.listen(document, "click", (event) => {
      const button = event.target?.closest?.(SEL.sendButton);
      if (!button || button.disabled)
        return;
      let near = button;
      while (near && !near.querySelector(SEL.editor))
        near = near.parentElement;
      const editor = near?.querySelector(SEL.editor) ?? getEditor();
      const text = getText(editor);
      if (text)
        fn(text, editor);
    }, { capture: true });
  }
  var composer_default = definePlugin({
    name: "ComposerApi",
    title: { zh: "输入框", en: "Composer API" },
    description: { zh: "读写 claude.ai 输入框内容、感知发送动作。", en: "Read and write the chat input and know when a prompt is sent." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {}
  });

  // src/plugins/_api/hotkeys/index.ts
  var isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  function parseCombo(spec) {
    const parts = spec.toLowerCase().split("+").map((s) => s.trim()).filter(Boolean);
    const combo = { key: "", ctrl: false, alt: false, shift: false, meta: false };
    for (const part of parts) {
      if (part === "mod")
        combo[isMac() ? "meta" : "ctrl"] = true;
      else if (part === "ctrl" || part === "control")
        combo.ctrl = true;
      else if (part === "alt" || part === "option")
        combo.alt = true;
      else if (part === "shift")
        combo.shift = true;
      else if (part === "meta" || part === "cmd")
        combo.meta = true;
      else
        combo.key = part;
    }
    return combo;
  }
  var CODE_KEYS = { Backquote: "`", Comma: ",", Period: ".", Slash: "/", Semicolon: ";", BracketLeft: "[", BracketRight: "]" };
  function matches(event, combo) {
    const key = CODE_KEYS[event.code] ?? (event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : event.code.startsWith("Digit") ? event.code.slice(5) : event.key.toLowerCase());
    return key === combo.key && event.ctrlKey === combo.ctrl && event.altKey === combo.alt && event.shiftKey === combo.shift && event.metaKey === combo.meta;
  }
  function comboKeys(spec) {
    const combo = parseCombo(spec);
    const mac = isMac();
    const parts = [combo.ctrl && (mac ? "⌃" : "Ctrl"), combo.alt && (mac ? "⌥" : "Alt"), combo.shift && (mac ? "⇧" : "Shift"), combo.meta && (mac ? "⌘" : "Win"), combo.key.length === 1 ? combo.key.toUpperCase() : combo.key];
    return parts.filter((p) => !!p);
  }
  function comboLabel(spec) {
    return comboKeys(spec).join(isMac() ? "" : "+");
  }
  function bindKey(scope, spec, fn, options = {}) {
    const combo = parseCombo(spec);
    scope.listen(window, "keydown", (event) => {
      if (event.isComposing || !matches(event, combo))
        return;
      if (!options.inInputs && isEditable(event.target))
        return;
      event.preventDefault();
      event.stopPropagation();
      fn(event);
    }, { capture: true });
  }
  var hotkeys_default = definePlugin({
    name: "HotkeysApi",
    title: { zh: "快捷键", en: "Hotkeys API" },
    description: { zh: "统一注册快捷键（mod 在 macOS 上是 ⌘，其它系统是 Ctrl）。", en: "Shortcut registration for plugins (mod = ⌘ on macOS, Ctrl elsewhere)." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {}
  });

  // src/plugins/_api/menu/index.ts
  function addMenuCommand(scope, name, fn) {
    if (typeof GM_registerMenuCommand !== "function")
      return;
    try {
      const id = GM_registerMenuCommand(name, fn);
      scope.defer(() => {
        try {
          if (typeof GM_unregisterMenuCommand === "function")
            GM_unregisterMenuCommand(id);
        } catch {}
      });
    } catch {}
  }
  var menu_default = definePlugin({
    name: "MenuApi",
    title: { zh: "脚本菜单", en: "Userscript menu API" },
    description: { zh: "在脚本管理器菜单里添加命令。", en: "Adds commands to the userscript manager's menu." },
    category: "api",
    icon: "list",
    hidden: true,
    start() {}
  });

  // src/lib/icons.ts
  var p = (d) => ["path", { d }];
  var c = (cx, cy, r) => ["circle", { cx, cy, r }];
  var ICONS = {
    plug: [p("M12 22v-5"), p("M9 8V2"), p("M15 8V2"), p("M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z")],
    settings: [c(12, 12, 3), p("M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z")],
    star: [p("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")],
    pin: [p("M12 17v5"), p("M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z")],
    x: [p("M18 6 6 18"), p("m6 6 12 12")],
    search: [c(11, 11, 8), p("m21 21-4.3-4.3")],
    refresh: [p("M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p("M3 3v5h5"), p("M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"), p("M16 16h5v5")],
    download: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("m7 10 5 5 5-5"), p("M12 15V3")],
    upload: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("m17 8-5-5-5 5"), p("M12 3v12")],
    history: [p("M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p("M3 3v5h5"), p("M12 7v5l4 2")],
    list: [p("M8 6h13"), p("M8 12h13"), p("M8 18h13"), p("M3 6h.01"), p("M3 12h.01"), p("M3 18h.01")],
    gauge: [p("m12 14 4-4"), p("M3.34 19a10 10 0 1 1 17.32 0")],
    bell: [p("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"), p("M10.3 21a1.94 1.94 0 0 0 3.4 0")],
    eyeOff: [p("M9.88 9.88a3 3 0 1 0 4.24 4.24"), p("M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"), p("M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"), p("m2 2 20 20")],
    width: [p("M21 12H3"), p("m7 8-4 4 4 4"), p("m17 8 4 4-4 4")],
    palette: [c(13.5, 6.5, 0.5), c(17.5, 10.5, 0.5), c(8.5, 7.5, 0.5), c(6.5, 12.5, 0.5), p("M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z")],
    message: [p("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z")],
    keyboard: [p("M2 6h20v12H2z"), p("M6 10h.01"), p("M10 10h.01"), p("M14 10h.01"), p("M18 10h.01"), p("M7 14h10")],
    code: [p("m16 18 6-6-6-6"), p("m8 6-6 6 6 6")],
    link: [p("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"), p("M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71")],
    clock: [c(12, 12, 10), p("M12 6v6l4 2")],
    shield: [p("M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z")],
    sparkles: [p("M9.94 14.06 4 20"), p("M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z")],
    trash: [p("M3 6h18"), p("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"), p("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")],
    chevronDown: [p("m6 9 6 6 6-6")],
    chevronRight: [p("m9 18 6-6-6-6")],
    brush: [p("m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"), p("M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z")],
    linkOff: [p("M9 17H7A5 5 0 0 1 7 7"), p("M15 7h2a5 5 0 0 1 4 8"), p("M8 12h4"), p("m2 2 20 20")],
    micOff: [p("m2 2 20 20"), p("M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"), p("M5 10v2a7 7 0 0 0 12 5"), p("M15 9.34V5a3 3 0 0 0-5.68-1.33"), p("M9 9v3a3 3 0 0 0 5.12 2.12"), p("M12 19v3")],
    user: [c(12, 8, 5), p("M20 21a8 8 0 0 0-16 0")],
    creditCard: [p("M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"), p("M2 10h20")],
    brain: [p("M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"), p("M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"), p("M12 5v13")],
    grid: [p("M3 3h7v7H3z"), p("M14 3h7v7h-7z"), p("M14 14h7v7h-7z"), p("M3 14h7v7H3z")],
    fileText: [p("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"), p("M14 2v4a2 2 0 0 0 2 2h4"), p("M16 13H8"), p("M16 17H8"), p("M10 9H8")],
    terminal: [p("m4 17 6-6-6-6"), p("M12 19h8")],
    incognito: [p("M2 12h20"), p("M5 12l2-7h10l2 7"), c(7, 17, 3), c(17, 17, 3), p("M10 17h4")],
    blend: [c(9, 9, 7), c(15, 15, 7)],
    tab: [p("M3 5h18v14H3z"), p("M3 9h18")],
    collapse: [p("m7 20 5-5 5 5"), p("m7 4 5 5 5-5")],
    puzzle: [p("M19.44 12.06a2 2 0 1 0-2.83-2.83L14 6.6V4a2 2 0 0 0-2-2H8v2.5a2 2 0 1 1-4 0V2H2v6h2.5a2 2 0 1 1 0 4H2v8h8v-2.5a2 2 0 1 1 4 0V20h4a2 2 0 0 0 2-2v-4l-.56-1.94Z")],
    sliders: [p("M4 21v-7"), p("M4 10V3"), p("M12 21v-9"), p("M12 8V3"), p("M20 21v-5"), p("M20 12V3"), p("M2 14h4"), p("M10 8h4"), p("M18 16h4")],
    globe: [c(12, 12, 10), p("M2 12h20"), p("M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z")],
    folder: [p("M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z")],
    copy: [p("M8 8h12v12H8z"), p("M4 16V6a2 2 0 0 1 2-2h10")],
    pencil: [p("M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"), p("m15 5 4 4")],
    plus: [p("M5 12h14"), p("M12 5v14")],
    alert: [p("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"), p("M12 9v4"), p("M12 17h.01")],
    info: [c(12, 12, 10), p("M12 16v-4"), p("M12 8h.01")],
    braces: [p("M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"), p("M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1")]
  };
  var GLYPHS = {
    plug: 57613,
    settings: 57558,
    star: 57575,
    pin: 57533,
    x: 57615,
    search: 57555,
    refresh: 57629,
    download: 57443,
    upload: 57562,
    history: 57481,
    list: 57500,
    gauge: 57647,
    bell: 57524,
    eyeOff: 57450,
    width: 57366,
    palette: 57522,
    message: 57399,
    keyboard: 57490,
    code: 57417,
    link: 57498,
    clock: 57411,
    shield: 57602,
    sparkles: 57607,
    trash: 57601,
    chevronDown: 57383,
    chevronRight: 57386,
    brush: 57661,
    linkOff: 57437,
    micOff: 57517,
    user: 57606,
    creditCard: 57432,
    brain: 57512,
    grid: 57476,
    fileText: 57452,
    terminal: 57423,
    incognito: 57461,
    blend: 57559,
    tab: 57574,
    collapse: 57421,
    puzzle: 57376,
    sliders: 57456,
    globe: 57618,
    folder: 57458,
    copy: 57455,
    pencil: 57444,
    plus: 57345,
    braces: 57418,
    alert: 57609,
    info: 57486
  };
  function glyph(name) {
    const code = GLYPHS[name];
    return code ? String.fromCodePoint(code) : null;
  }
  var iconNames = Object.keys(ICONS);
  function icon(name, size = 16, strokeWidth = 2) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const attrs = {
      width: String(size),
      height: String(size),
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": String(strokeWidth),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    };
    for (const [key, value] of Object.entries(attrs))
      svg.setAttribute(key, value);
    for (const [tag, shapeAttrs] of ICONS[name] ?? ICONS.puzzle) {
      const el = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(shapeAttrs))
        el.setAttribute(key, String(value));
      svg.appendChild(el);
    }
    return svg;
  }

  // src/lib/ui.ts
  var BASE_CSS = `
:host { all: initial; }
/* claude.ai's own design tokens (--cds-*) cascade into shadow roots, so CC++ looks and themes
   like the page. The literals are fallbacks for when claude.ai renames a token. */
.ccpp { --bg: var(--cds-surface-2, #ffffff); --bg-nav: var(--cds-surface-1, #f5f4ef); --bg2: var(--cds-fill-ghost-hover, #f0eee6); --bg3: var(--cds-fill-ghost-selected, #e8e6dc);
  --fg: var(--cds-text-primary, #1f1e1d); --fg2: var(--cds-text-secondary, #5e5d59); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(31,30,29,.12)); --line-soft: var(--cds-alpha-1, rgba(31,30,29,.06));
  --accent: var(--cds-fill-accent, #2a78d6); --accent-fg: #fff; --clay: #d97757; --ok: #3f9a5b; --warn: var(--cds-fill-warning, #c98a12); --bad: #d03b3b;
  --field: var(--cds-fill-field, transparent); --field-ring: var(--cds-fill-field-ring, rgba(31,30,29,.15));
  --radius: var(--cds-radius, 8px); --radius-card: calc(var(--cds-radius, 8px) + 4px); --h: var(--cds-h-control, 32px);
  --shadow: inset 0 0 0 var(--cds-ring-inner, 0) var(--cds-ring-color, transparent), 0 0 0 var(--cds-ring-outer, 1px) var(--cds-ring-color, rgba(31,30,29,.1)), var(--cds-shadow-lg, 0 8px 24px rgba(0,0,0,.14));
  --focus: var(--cds-focus-shadow, 0 0 0 2px #2a78d6);
  --fs: var(--cds-font-size-body, 14px); --fs-sm: var(--cds-font-size-footnote, 13px); --fs-xs: var(--cds-font-size-caption, 12px);
  font-size: var(--fs); line-height: 1.45; color: var(--fg); -webkit-font-smoothing: antialiased; }
.ccpp:not(.dark) { color-scheme: light; } .ccpp.dark { color-scheme: dark;
  --bg: var(--cds-surface-2, #262624); --bg-nav: var(--cds-surface-1, #1f1e1d); --bg2: var(--cds-fill-ghost-hover, rgba(255,255,255,.06)); --bg3: var(--cds-fill-ghost-selected, rgba(255,255,255,.1));
  --fg: var(--cds-text-primary, #f5f4ef); --fg2: var(--cds-text-secondary, #c2c0b6); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(255,255,255,.1)); --line-soft: var(--cds-alpha-1, rgba(255,255,255,.05)); --field-ring: var(--cds-fill-field-ring, rgba(255,255,255,.15)); }
.ccpp * { box-sizing: border-box; }
/* Scrollbars like claude.ai's (html: thin, a translucent text-colored thumb, no track); :host { all: initial }
   cuts the inherited value off, so it is set again here. */
.ccpp, .ccpp * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--fg) 35%, transparent) transparent; }
.ccpp button { font: inherit; color: inherit; cursor: pointer; }
.ccpp :focus-visible { outline: none; box-shadow: var(--focus); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: var(--h); padding: 0 12px; border-radius: var(--radius); border: 0; background: var(--bg2); color: var(--fg); white-space: nowrap; }
.btn:hover { background: var(--bg3); }
.btn.ghost { background: transparent; } .btn.ghost:hover { background: var(--bg2); }
.btn.primary { background: var(--fg); color: var(--bg); } .btn.primary:hover { opacity: .9; }
.btn.danger { color: var(--bad); }
.btn:disabled { opacity: .45; cursor: default; }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: var(--radius); border: 0; background: transparent; color: var(--fg3); }
.icon-btn:hover { background: var(--bg2); color: var(--fg); }
.icon-btn.on { color: var(--fg); }
.icon-btn:disabled { opacity: .35; pointer-events: none; }
.input { height: var(--h); padding: 0 10px; border-radius: var(--radius); border: 0; box-shadow: inset 0 0 0 1px var(--field-ring); background: var(--field); color: var(--fg); font: inherit; outline: none; width: 100%; }
.input::placeholder { color: var(--fg3); }
.input:focus, textarea.input:focus { outline: none; box-shadow: var(--focus); }
textarea.input { height: auto; padding: 8px 10px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.5; }
select.input { padding-right: 6px; }
/* Same proportions as claude.ai's Switch: height h, width 1.8h, 2px inset knob. */
.switch { --sh: var(--cds-switch-h, 20px); position: relative; width: calc(var(--sh) * 1.8); height: var(--sh); flex: none; border-radius: 999px; border: 0; padding: 0; background: var(--cds-switch-track, rgba(127,127,127,.35)); transition: background .15s; }
.switch:hover { background: var(--cds-switch-track-hover, rgba(127,127,127,.45)); }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: calc(var(--sh) - 4px); height: calc(var(--sh) - 4px); border-radius: 50%; background: var(--cds-switch-knob, #fff); box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .18s cubic-bezier(.3,1.4,.6,1); }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"]::after { transform: translateX(calc(var(--sh) * .8)); }
.switch:disabled { opacity: .45; cursor: default; }
.muted { color: var(--fg3); }
.badge { display: inline-flex; align-items: center; height: 18px; padding: 0 6px; border-radius: 6px; font-size: 11px; font-weight: 500; background: var(--bg3); color: var(--fg2); }
.badge.accent { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); }
.badge.bad { background: color-mix(in srgb, var(--bad) 16%, transparent); color: var(--bad); }
@media (prefers-reduced-motion: reduce) { .ccpp * { transition: none !important; animation: none !important; } }
`;
  function isOurField(event) {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLElement))
      return false;
    const root = target.getRootNode();
    if (!(root instanceof ShadowRoot) || !root.host.hasAttribute?.("data-ccpp-shadow"))
      return false;
    return target.matches("input, textarea, select") || target.isContentEditable;
  }
  try {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey)
        return;
      const typing = event.key.length === 1 || ["Backspace", "Delete", "Process"].includes(event.key) || event.isComposing;
      if (typing && isOurField(event))
        event.stopImmediatePropagation();
    }, true);
  } catch {}
  function shadowBox(css, tag = "div") {
    const host = document.createElement(tag);
    host.setAttribute("data-ccpp-shadow", "");
    const root = host.attachShadow({ mode: "open" });
    root.appendChild(h("style", { text: BASE_CSS + css }));
    const box = h("div", { class: "ccpp" });
    root.appendChild(box);
    const sync = () => {
      box.classList.toggle("dark", isDark());
      if (document.body)
        box.style.fontFamily = getComputedStyle(document.body).fontFamily;
    };
    sync();
    return { host, root, box, sync };
  }
  var LAYER_Z = { page: "40", top: "2147483600" };
  function createHost(scope, id, css, options = {}) {
    const { host, root, box, sync } = shadowBox(css);
    host.id = `ccpp-${id}`;
    host.dataset.ccpp = id;
    const layer = options.layer ?? "top";
    host.dataset.ccppLayer = layer;
    if (options.fixed !== false)
      Object.assign(host.style, { position: "fixed", inset: "0", zIndex: LAYER_Z[layer], pointerEvents: "none" });
    if (layer === "page")
      ensurePageLayerCss();
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, sync);
    const attach = () => {
      if (document.body && host.parentNode !== document.body)
        document.body.appendChild(host);
    };
    attach();
    if (!document.body)
      scope.listen(document, "DOMContentLoaded", attach, { once: true });
    scope.interval(attach, 2000);
    scope.defer(() => host.remove());
    return { host, root, box };
  }
  function anchorPosition(anchor, panel, gap = 8) {
    const rect = anchor.getBoundingClientRect();
    const { innerWidth: vw, innerHeight: vh } = window;
    const width = panel.offsetWidth || 280;
    const height = panel.offsetHeight || 200;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(vw - width - 8, left));
    const above = rect.top - gap - height;
    const top = above >= 8 || rect.bottom + gap + height > vh ? Math.max(8, above) : rect.bottom + gap;
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }
  var pageLayerCss = null;
  function ensurePageLayerCss() {
    if (pageLayerCss?.isConnected)
      return;
    pageLayerCss = document.createElement("style");
    pageLayerCss.id = "ccpp-page-layer";
    pageLayerCss.textContent = `body:has([role="dialog"][aria-modal="true"], [role="alertdialog"], [role="dialog"][data-perf-overlay]) > [data-ccpp-layer="page"] { visibility: hidden !important; }`;
    (document.head ?? document.documentElement).appendChild(pageLayerCss);
  }

  // src/plugins/_api/notices/index.ts
  var CSS2 = `
.stack { position: fixed; top: 64px; right: 16px; display: flex; flex-direction: column; gap: 8px; width: min(340px, calc(100vw - 32px)); pointer-events: none; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 10px 10px 12px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); animation: in .18s ease-out; }
.toast.click { cursor: pointer; }
.toast .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: none; background: var(--accent); }
.toast.ok .dot { background: var(--ok); } .toast.warn .dot { background: var(--warn); } .toast.error .dot { background: var(--bad); }
.toast .body { flex: 1; min-width: 0; } .toast .title { font-weight: 600; } .toast .text { color: var(--fg2); word-break: break-word; white-space: pre-line; }
@keyframes in { from { opacity: 0; transform: translateY(-6px); } }
`;
  var host = null;
  var stack = null;
  var byKey = new Map;
  function toast(text, options = {}) {
    if (!stack)
      return () => {};
    if (options.key)
      byKey.get(options.key)?.remove();
    const close = () => {
      el.remove();
      if (options.key && byKey.get(options.key) === el)
        byKey.delete(options.key);
    };
    const el = h("div", { class: `toast ${options.kind ?? "info"}${options.onClick ? " click" : ""}`, role: "status" }, h("span", { class: "dot" }), h("div", { class: "body" }, options.title ? h("div", { class: "title", text: options.title }) : null, h("div", { class: "text", text })), h("button", { class: "icon-btn", "aria-label": "Close", onclick: (e) => (e.stopPropagation(), close()) }, icon("x", 14)));
    if (options.onClick)
      el.addEventListener("click", () => (options.onClick(), close()));
    if (options.key)
      byKey.set(options.key, el);
    stack.appendChild(el);
    const timeout = options.timeoutMs ?? 5000;
    if (timeout > 0)
      setTimeout(close, timeout);
    return close;
  }
  var notices_default = definePlugin({
    name: "NoticesApi",
    title: { zh: "提示条", en: "Notices API" },
    description: { zh: "右上角的 CC++ 提示条，供其它插件显示消息。", en: "CC++ toasts at the top right for other plugins." },
    category: "api",
    icon: "bell",
    hidden: true,
    start(scope) {
      host = createHost(scope, "notices", CSS2);
      stack = h("div", { class: "stack" });
      host.box.appendChild(stack);
      scope.defer(() => {
        host = null;
        stack = null;
        byKey.clear();
      });
    }
  });

  // src/plugins/_api/styles/index.ts
  var container = null;
  function ensureContainer() {
    if (container?.isConnected)
      return container;
    container ??= h("div", { id: "ccpp-styles", hidden: true });
    (document.head ?? document.documentElement).appendChild(container);
    return container;
  }
  function addStyle(scope, css, id) {
    const style = h("style", { "data-ccpp-style": id ?? "" });
    style.textContent = css;
    ensureContainer().appendChild(style);
    scope.defer(() => style.remove());
    return (next) => void (style.textContent = next);
  }
  var styles_default = definePlugin({
    name: "StylesApi",
    title: { zh: "样式注入", en: "Styles API" },
    description: { zh: "管理各插件注入的页面样式，插件停用时自动移除。", en: "Page stylesheets for plugins, removed when a plugin stops." },
    category: "api",
    icon: "palette",
    hidden: true,
    startAt: "document-start",
    start(scope) {
      ensureContainer();
      scope.interval(() => {
        if (container && container.parentNode && container !== container.parentNode.lastElementChild && document.head)
          document.head.appendChild(container);
      }, 3000);
      scope.defer(() => {
        container?.remove();
        container = null;
      });
    }
  });

  // src/plugins/_api/slots/index.ts
  var items = new Set;
  var containers = new Map([["composer", new Set], ["header", new Set], ["codeHeader", new Set]]);
  var CSS3 = `
.ccpp-slot { display: inline-flex; align-items: center; gap: 4px; flex: none; }
.ccpp-slot:empty { display: none; }
.ccpp-slot-composer { margin-inline-end: 4px; }
.ccpp-slot-header { margin-inline-end: 4px; }
.ccpp-slot-codeHeader { margin-inline: 0; }
.ccpp-slot-codeHeader .ccpp-slot-btn { min-width: var(--cds-h-control, 32px); height: var(--cds-h-control, 32px); padding: 0 6px; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); }
.ccpp-slot-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: 12px; cursor: pointer; }
/* Same colors and hover as claude.ai's ghost buttons next to it. */
.ccpp-slot-btn:hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-slot-btn.on { color: #d97757; opacity: 1; }
.ccpp-slot-btn[hidden] { display: none; }
`;
  function place(item, container) {
    let node = item.nodes.get(container);
    if (!node || !node.isConnected) {
      node = item.render();
      node.dataset.ccppItem = item.id;
      item.nodes.set(container, node);
    }
    const siblings = [...container.children];
    const before = siblings.find((el) => el !== node && Number(el.dataset.ccppOrder ?? 0) > item.order);
    node.dataset.ccppOrder = String(item.order);
    if (node.parentNode !== container || before && node.nextSibling !== before)
      container.insertBefore(node, before ?? null);
  }
  function fill(container, slot) {
    for (const item of items)
      if (item.slot === slot)
        place(item, container);
  }
  function addSlotItem(scope, slot, id, render, order = 0) {
    const item = { id, slot, order, render, nodes: new Map };
    items.add(item);
    for (const container of containers.get(slot))
      place(item, container);
    scope.defer(() => {
      items.delete(item);
      for (const node of item.nodes.values())
        node.remove();
      item.nodes.clear();
    });
    return item;
  }
  function refreshSlotItem(item) {
    for (const [container, node] of item.nodes) {
      const next = item.render();
      next.dataset.ccppItem = item.id;
      next.dataset.ccppOrder = String(item.order);
      node.replaceWith(next);
      item.nodes.set(container, next);
    }
  }
  var slotButton = (label, onClick, ...children) => h("button", { type: "button", class: "ccpp-slot-btn", "aria-label": label, ...tipAttrs(label), onclick: onClick }, ...children);
  var CODE_TITLE = '[data-pane-title], [data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]';
  var isDragHandle = (b) => /(^|\s)tiles-drag-handle(\s|$)/.test(b.className) || b.matches("[data-drag-handle], [aria-roledescription='drag handle']");
  function codeHeaderAnchor(title) {
    const toolbar = title.closest('[data-cds="Toolbar"]');
    const last = toolbar && [...toolbar.querySelectorAll("button")].filter((b) => !b.closest(".ccpp-slot") && !isDragHandle(b) && !title.contains(b)).pop();
    if (toolbar && last && title.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING) {
      let group = last;
      while (group.parentElement && group.parentElement !== toolbar && !group.parentElement.contains(title))
        group = group.parentElement;
      if (!group.contains(title) && group !== last)
        return { anchor: group, where: "prepend" };
    }
    let branch = title;
    for (let depth = 0;depth < 6 && branch.parentElement; depth++) {
      const row = branch.parentElement;
      const button = [...row.querySelectorAll("button")].find((b) => !branch.contains(b) && !b.closest(".ccpp-slot") && !isDragHandle(b) && branch.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (button) {
        let anchor = button;
        while (anchor.parentElement && anchor.parentElement !== row && anchor.parentElement.children.length === 1)
          anchor = anchor.parentElement;
        return { anchor, where: "before" };
      }
      branch = row;
    }
    let anchor = title;
    while (anchor.parentElement && anchor.parentElement.children.length === 1)
      anchor = anchor.parentElement;
    return { anchor, where: "after" };
  }
  var slots_default = definePlugin({
    name: "SlotsApi",
    title: { zh: "界面插槽", en: "UI slots API" },
    description: { zh: "在输入框模型选择器旁、对话标题栏右侧放置插件按钮。", en: "Puts plugin controls next to the model picker and in the chat header." },
    category: "api",
    icon: "grid",
    hidden: true,
    dependencies: ["DomApi", "StylesApi"],
    start(scope) {
      addStyle(scope, CSS3, "slots");
      const mountIn = (slot, anchor, where) => {
        const container = h("span", { class: `ccpp-slot ccpp-slot-${slot}`, "data-ccpp-slot": slot });
        if (where === "before")
          anchor.before(container);
        else if (where === "after")
          anchor.after(container);
        else
          anchor.prepend(container);
        containers.get(slot).add(container);
        fill(container, slot);
        return () => {
          containers.get(slot).delete(container);
          container.remove();
        };
      };
      watch(scope, SEL.modelSelector, (el) => {
        let anchor = el;
        while (anchor.parentElement && anchor.parentElement.children.length === 1 && !anchor.parentElement.matches(SEL.composer))
          anchor = anchor.parentElement;
        return mountIn("composer", anchor, "before");
      });
      watch(scope, SEL.headerActions, (el) => mountIn("header", el, "prepend"));
      watch(scope, CODE_TITLE, (el) => {
        if (!/^\/code\/[^/]/.test(location.pathname))
          return;
        const { anchor, where } = codeHeaderAnchor(el);
        if ((where === "prepend" ? anchor : anchor.parentElement)?.querySelector(":scope > .ccpp-slot-codeHeader"))
          return;
        return mountIn("codeHeader", anchor, where);
      });
    }
  });

  // src/plugins/_api/transcript/index.ts
  var FEEDS = `${SEL.scroller}, [data-testid="epitaxy-virtual-transcript"], [role="feed"][data-autoscroll-container]`;
  var lastFeed = null;
  function getScrollers() {
    return [...document.querySelectorAll(FEEDS)].filter((el) => el.isConnected && el.clientHeight > 0);
  }
  function getScroller() {
    const all = getScrollers();
    if (!all.length)
      return null;
    if (lastFeed && all.includes(lastFeed))
      return lastFeed;
    return all.find((el) => el.closest('[data-perf-region="side_pane"]')) ?? all[0];
  }
  function noteFeedActivity(target) {
    if (!(target instanceof Element))
      return;
    const feed = target.closest(FEEDS);
    if (feed)
      lastFeed = feed;
  }
  var SR_PREFIX = /^(?:You said|Claude responded|你说|Claude 回复)[:：]\s*/;
  function rowText(el) {
    const body = el.querySelector(`${SEL.userMessageBody}, ${SEL.userMessage}, ${SEL.prose}`) ?? el;
    return (body.innerText || "").replace(SR_PREFIX, "").trim();
  }
  function getRows(root = getScroller()) {
    if (!root)
      return [];
    return [...root.querySelectorAll(SEL.transcriptRow)].map((el) => {
      const index = Number(el.dataset.index);
      const message = el.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
      const role = message?.matches(SEL.userMessage) || el.dataset.perfRow === "human" ? "user" : "assistant";
      const keyed = el.querySelector("[data-turn-key]");
      const entry = el.querySelector("[data-epitaxy-entry]")?.dataset.epitaxyEntry ?? null;
      return { index, el, role, turnKey: keyed?.dataset.turnKey ?? null, entry };
    }).filter((row) => Number.isFinite(row.index)).sort((a, b) => a.index - b.index);
  }
  function totalMessages(root = getScroller()) {
    const article = root?.querySelector("[aria-setsize]");
    const size = Number(article?.getAttribute("aria-setsize"));
    return Number.isFinite(size) && size > 0 ? size : null;
  }
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var JUMP_OFFSET = 72;
  function scrollRowIntoView(scroller, row, behavior) {
    const delta = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - JUMP_OFFSET;
    scroller.scrollBy({ top: delta, behavior });
  }
  async function jumpTo(index, options = {}) {
    const scroller = options.scroller ?? getScroller();
    if (!scroller)
      return null;
    const token = (jumpTokens.get(scroller) ?? 0) + 1;
    jumpTokens.set(scroller, token);
    let cancelled = false;
    const cancel = () => cancelled = true;
    const events = ["wheel", "touchstart", "pointerdown", "keydown"];
    for (const type of events)
      scroller.addEventListener(type, cancel, { passive: true, capture: true });
    try {
      return await stepTo(scroller, index, options, () => cancelled || jumpTokens.get(scroller) !== token);
    } finally {
      for (const type of events)
        scroller.removeEventListener(type, cancel, { capture: true });
    }
  }
  var jumpTokens = new WeakMap;
  async function stepTo(scroller, index, options, stopped) {
    let nearby = false;
    let waited = 0;
    for (let attempt = 0;attempt < 24; attempt++) {
      if (stopped())
        return null;
      const rows = getRows(scroller);
      const byEntry = options.entry ? rows.find((r) => r.entry === options.entry || r.turnKey === options.entry) : undefined;
      const row = byEntry ?? rows.find((r) => r.index === index);
      if (row && !byEntry && options.entry && !nearby) {
        nearby = true;
        scrollRowIntoView(scroller, row.el, "auto");
        await sleep(120);
        continue;
      }
      if (row) {
        scrollRowIntoView(scroller, row.el, options.behavior ?? "smooth");
        if (options.flash !== false)
          flash(row.el);
        return settle(scroller, row.el, () => {
          const now = getRows(scroller);
          return (options.entry ? now.find((r) => r.entry === options.entry || r.turnKey === options.entry) : undefined) ?? now.find((r) => r.index === row.index);
        }, stopped);
      }
      if (!rows.length) {
        if (waited++ < 120)
          attempt--;
        await sleep(120);
        continue;
      }
      const first = rows[0];
      const last = rows[rows.length - 1];
      const span = last.el.getBoundingClientRect().bottom - first.el.getBoundingClientRect().top;
      const average = Math.max(80, span / rows.length);
      const anchor = index < first.index ? first : last;
      const distance = (index - anchor.index) * average;
      scroller.scrollBy({ top: Math.max(-scroller.clientHeight * 3, Math.min(scroller.clientHeight * 3, distance)), behavior: "auto" });
      await sleep(90);
    }
    return null;
  }
  async function settle(scroller, el, find, stopped) {
    let target = el;
    let stable = 0;
    for (let i = 0;i < 20 && stable < 3; i++) {
      await sleep(100);
      if (stopped())
        break;
      target = find()?.el ?? target;
      if (!target.isConnected)
        break;
      const delta = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - JUMP_OFFSET;
      if (Math.abs(delta) <= 4)
        stable++;
      else {
        stable = 0;
        scroller.scrollBy({ top: delta, behavior: "auto" });
      }
    }
    return target;
  }
  function flash(el) {
    const target = el.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}, [role="article"]`) ?? el;
    target.classList.remove("ccpp-flash");
    target.offsetWidth;
    target.classList.add("ccpp-flash");
    setTimeout(() => target.classList.remove("ccpp-flash"), 1600);
  }
  function currentIndex(scroller = getScroller()) {
    if (!scroller)
      return null;
    const top = scroller.getBoundingClientRect().top + JUMP_OFFSET + 8;
    let best = null;
    for (const row of getRows(scroller)) {
      const rect = row.el.getBoundingClientRect();
      if (rect.height === 0)
        continue;
      if (rect.top <= top)
        best = row;
      else {
        best ??= row;
        break;
      }
    }
    return best?.index ?? null;
  }
  var cache = new Map;
  var CACHE_MS = 60000;
  function loadConversation(chatId = currentRoute().chatId, force = false) {
    if (!chatId)
      return null;
    const hit = cache.get(chatId);
    if (hit && !force && Date.now() - hit.at < CACHE_MS)
      return hit.promise;
    const promise = getConversation(chatId);
    cache.set(chatId, { at: Date.now(), promise });
    promise.catch(() => cache.delete(chatId));
    return promise;
  }
  var invalidateConversation = (chatId) => chatId && cache.delete(chatId);
  var marks = new Map;
  var markListeners = new Set;
  function setMarks(source, indices) {
    marks.set(source, new Set(indices));
    for (const fn of [...markListeners])
      fn();
  }
  var getMarks = (source) => marks.get(source) ?? new Set;
  function onMarksChange(scope, fn) {
    markListeners.add(fn);
    scope.defer(() => markListeners.delete(fn));
  }
  var CSS4 = `
@keyframes ccpp-flash { 0%, 70% { outline-color: var(--cds-text-primary, currentColor); } 100% { outline-color: transparent; } }
.ccpp-flash { outline: 2px solid transparent; outline-offset: 4px; border-radius: 12px; animation: ccpp-flash 1.6s ease-out; }
`;
  var transcript_default = definePlugin({
    name: "TranscriptApi",
    title: { zh: "对话内容", en: "Transcript API" },
    description: { zh: "定位对话里的消息、跳转到第 N 条（含未渲染的虚拟行），并缓存对话内容。", en: "Finds messages in the chat, jumps to message N (also virtualised rows) and caches the conversation." },
    category: "api",
    icon: "list",
    hidden: true,
    dependencies: ["ClaudeApi", "RouterApi", "ChatStateApi", "StylesApi"],
    start(scope) {
      addStyle(scope, CSS4, "transcript");
      scope.on("reply:end", ({ chatId }) => invalidateConversation(chatId));
      const note = (event) => noteFeedActivity(event.target);
      scope.listen(document, "pointerdown", note, { capture: true, passive: true });
      scope.listen(document, "wheel", note, { capture: true, passive: true });
      scope.defer(() => cache.clear());
    }
  });

  // src/kernel/i18n.ts
  function claudeLocale() {
    try {
      const stored = globalThis.localStorage?.getItem("spa:locale");
      if (stored)
        return stored.replace(/^"|"$/g, "");
    } catch {}
    return globalThis.document?.documentElement?.lang ?? "";
  }
  var detect = () => /^zh/i.test(claudeLocale()) ? "zh" : "en";
  var mode = "auto";
  var lang = detect();
  var getLang = () => lang;
  var setLang = (next) => void (mode = next, lang = next === "auto" ? detect() : next);
  var t = (text) => typeof text === "string" ? text : text[lang];
  try {
    new MutationObserver(() => mode === "auto" && (lang = detect())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  } catch {}

  // src/plugins/_core/settings/imageField.ts
  var L = {
    pick: { zh: "选择图片…", en: "Choose picture…" },
    clear: { zh: "清除", en: "Clear" },
    reset: { zh: "重置裁切", en: "Reset crop" },
    placeholder: { zh: "粘贴图片，或输入 https://…", en: "Paste a picture, or https://…" },
    hint: { zh: "也可以把图片拖到圆圈上，或在这里直接粘贴。拖动圆圈调整位置，滚轮或滑块缩放。", en: "You can also drop a picture on the circle or paste one here. Drag the circle to pan; scroll or use the slider to zoom." },
    zoom: { zh: "缩放", en: "Zoom" },
    loading: { zh: "正在读取图片…", en: "Loading the picture…" },
    remoteFail: { zh: "读取不到这张网络图片，无法裁切；已原样保存链接，但 claude.ai 可能拦截它。建议下载后粘贴或拖进来。", en: "Couldn't load that picture, so it can't be cropped; the link is saved as is, but claude.ai may block it. Download it and paste or drop it instead." },
    badFile: { zh: "这不是可读取的图片。", en: "That isn't a readable picture." }
  };
  var SOURCE_PX = 1024;
  var ZOOM_MIN = 1;
  var ZOOM_MAX = 4;
  var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function cropRect(w, hgt, crop) {
    const zoom = clamp(crop.zoom, ZOOM_MIN, ZOOM_MAX);
    const side = Math.min(w, hgt) / zoom;
    const x = clamp(crop.x * w, side / 2, Math.max(side / 2, w - side / 2));
    const y = clamp(crop.y * hgt, side / 2, Math.max(side / 2, hgt - side / 2));
    return { side, x, y, zoom, crop: { x: x / w, y: y / hgt, zoom } };
  }
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img : null);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  function canvasUrl(canvas) {
    const webp = canvas.toDataURL("image/webp", 0.9);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }
  function draw(img, w, hgt, from) {
    const canvas = h("canvas", { width: w, height: hgt });
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return null;
    ctx.imageSmoothingQuality = "high";
    if (from)
      ctx.drawImage(img, from.x - from.side / 2, from.y - from.side / 2, from.side, from.side, 0, 0, w, hgt);
    else
      ctx.drawImage(img, 0, 0, w, hgt);
    try {
      return canvasUrl(canvas);
    } catch {
      return null;
    }
  }
  async function capped(src) {
    const img = await loadImage(src);
    if (!img)
      return null;
    const scale = Math.min(1, SOURCE_PX / Math.max(img.naturalWidth, img.naturalHeight));
    return draw(img, Math.max(1, Math.round(img.naturalWidth * scale)), Math.max(1, Math.round(img.naturalHeight * scale)));
  }
  async function bake(src, crop, size) {
    const img = await loadImage(src);
    if (!img)
      return null;
    const r = cropRect(img.naturalWidth, img.naturalHeight, crop);
    return draw(img, size, size, r);
  }
  var blobToDataUrl = (blob) => new Promise((resolve) => {
    const reader = new FileReader;
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
  function fetchImage(url) {
    const fromBlob = (blob) => blob && blob.type.startsWith("image/") ? blobToDataUrl(blob) : Promise.resolve(null);
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise((resolve) => GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: 15000,
        responseType: "blob",
        onload: (r) => void (r.status >= 200 && r.status < 300 ? fromBlob(r.response).then(resolve) : resolve(null)),
        onerror: () => resolve(null),
        ontimeout: () => resolve(null)
      }));
    }
    return fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" }).then((r) => r.ok ? r.blob() : null).then(fromBlob).catch(() => null);
  }
  function imageFile(data) {
    if (!data)
      return null;
    for (const file of data.files)
      if (file.type.startsWith("image/"))
        return file;
    for (const item of data.items)
      if (item.kind === "file" && item.type.startsWith("image/"))
        return item.getAsFile();
    return null;
  }
  function imageField(option, value, set) {
    const size = option.size ?? 256;
    let current = value;
    let source = value.startsWith("data:image/") ? value : "";
    let natural = null;
    let crop = { x: 0.5, y: 0.5, zoom: 1 };
    let generation = 0;
    let bakeTimer = null;
    const stageImg = h("img", { alt: "", draggable: "false", referrerpolicy: "no-referrer" });
    const stage = h("div", { class: "img-stage", title: t(L.hint) }, stageImg);
    const zoom = h("input", { type: "range", min: ZOOM_MIN, max: ZOOM_MAX, step: 0.05, value: "1", "aria-label": t(L.zoom) });
    const zoomOut = h("output", { text: "100%" });
    const resetBtn = h("button", { type: "button", class: "btn", text: t(L.reset) });
    const url = h("input", { class: "input", placeholder: option.placeholder ? t(option.placeholder) : t(L.placeholder), "aria-label": t(option.label) });
    const file = h("input", { type: "file", accept: "image/*", style: { display: "none" } });
    const pick = h("button", { type: "button", class: "btn", text: t(L.pick) });
    const clearBtn = h("button", { type: "button", class: "btn", text: t(L.clear) });
    const note = h("div", { class: "row-desc img-note" });
    const zoomRow = h("div", { class: "img-zoom" }, zoom, zoomOut, resetBtn);
    const field = h("div", { class: "img-field" }, stage, h("div", { class: "img-side" }, h("div", { class: "img-line" }, url, pick, clearBtn), zoomRow, note), file);
    const say = (text) => note.textContent = text;
    const save = (next) => {
      current = next;
      set(next);
    };
    const paint = () => {
      const shown = source || current;
      stage.classList.toggle("empty", !shown);
      if (!shown)
        stageImg.removeAttribute("src");
      else if (stageImg.getAttribute("src") !== shown)
        stageImg.src = shown;
      zoomRow.hidden = !source;
      zoom.value = String(crop.zoom);
      zoomOut.textContent = `${Math.round(crop.zoom * 100)}%`;
      if (!url.matches(":focus"))
        url.value = current.startsWith("data:") ? "" : current;
      clearBtn.disabled = !current;
      if (!source || !natural) {
        Object.assign(stageImg.style, { width: "100%", height: "100%", left: "0", top: "0" });
        return;
      }
      const r = cropRect(natural.w, natural.h, crop);
      Object.assign(stageImg.style, {
        width: `${natural.w / r.side * 100}%`,
        height: `${natural.h / r.side * 100}%`,
        left: `${(0.5 - r.x / r.side) * 100}%`,
        top: `${(0.5 - r.y / r.side) * 100}%`
      });
    };
    const commit = (next, immediate = false) => {
      if (!source || !natural)
        return;
      crop = cropRect(natural.w, natural.h, next).crop;
      paint();
      if (bakeTimer)
        clearTimeout(bakeTimer);
      const src = source;
      const run = () => {
        const at = { ...crop };
        bake(src, at, size).then((out) => {
          if (out && src === source)
            save(out);
        });
      };
      if (immediate)
        run();
      else
        bakeTimer = setTimeout(run, 120);
    };
    const adopt = async (src, keep = false) => {
      const gen = ++generation;
      const img = await loadImage(src);
      if (gen !== generation)
        return;
      if (!img) {
        say(t(L.badFile));
        return;
      }
      source = src;
      natural = { w: img.naturalWidth, h: img.naturalHeight };
      crop = { x: 0.5, y: 0.5, zoom: 1 };
      say("");
      if (keep)
        paint();
      else
        commit(crop, true);
    };
    const takeBlob = async (blob) => {
      const gen = ++generation;
      say(t(L.loading));
      const raw = await blobToDataUrl(blob);
      const src = raw && await capped(raw);
      if (gen !== generation)
        return;
      if (!src)
        return say(t(L.badFile));
      await adopt(src);
    };
    const takeText = async (raw) => {
      const text = raw.trim();
      const gen = ++generation;
      if (!text) {
        source = "";
        natural = null;
        say("");
        save("");
        return paint();
      }
      if (!isImageUrl(text))
        return say(t(L.badFile));
      if (text.startsWith("data:image/")) {
        const src = await capped(text);
        if (gen !== generation)
          return;
        return src ? adopt(src) : say(t(L.badFile));
      }
      say(t(L.loading));
      const fetched = await fetchImage(text);
      const src = fetched && await capped(fetched);
      if (gen !== generation)
        return;
      if (src)
        return adopt(src);
      source = "";
      natural = null;
      save(text);
      say(t(L.remoteFail));
      paint();
    };
    const onPaste = (event) => {
      const found = imageFile(event.clipboardData);
      if (!found)
        return;
      event.preventDefault();
      takeBlob(found);
    };
    url.addEventListener("change", () => void takeText(url.value));
    url.addEventListener("paste", onPaste);
    field.addEventListener("paste", onPaste);
    pick.addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
      const picked = file.files?.[0];
      file.value = "";
      if (picked)
        takeBlob(picked);
    });
    clearBtn.addEventListener("click", () => {
      url.value = "";
      takeText("");
    });
    resetBtn.addEventListener("click", () => commit({ x: 0.5, y: 0.5, zoom: 1 }, true));
    zoom.addEventListener("input", () => commit({ ...crop, zoom: Number(zoom.value) }));
    stage.addEventListener("dragover", (event) => {
      if (imageFile(event.dataTransfer))
        event.preventDefault();
    });
    stage.addEventListener("drop", (event) => {
      const found = imageFile(event.dataTransfer);
      if (!found)
        return;
      event.preventDefault();
      takeBlob(found);
    });
    stage.addEventListener("wheel", (event) => {
      if (!source)
        return;
      event.preventDefault();
      commit({ ...crop, zoom: crop.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08) });
    }, { passive: false });
    let drag = null;
    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !source || !natural)
        return;
      stage.setPointerCapture(event.pointerId);
      drag = { px: event.clientX, py: event.clientY, from: { ...crop } };
    });
    stage.addEventListener("pointermove", (event) => {
      if (!drag || !natural || !stage.clientWidth)
        return;
      const { side } = cropRect(natural.w, natural.h, drag.from);
      const perPx = side / stage.clientWidth;
      crop = cropRect(natural.w, natural.h, {
        x: drag.from.x - (event.clientX - drag.px) * perPx / natural.w,
        y: drag.from.y - (event.clientY - drag.py) * perPx / natural.h,
        zoom: drag.from.zoom
      }).crop;
      paint();
    });
    const endDrag = () => {
      if (!drag)
        return;
      drag = null;
      commit(crop, true);
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    if (source)
      adopt(source, true);
    paint();
    return field;
  }
  var IMAGE_FIELD_CSS = `
.img-field { display: flex; gap: 14px; align-items: flex-start; }
.img-stage { position: relative; flex: none; width: 96px; height: 96px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--fg3) 14%, transparent); box-shadow: inset 0 0 0 1px var(--field-ring); cursor: grab; touch-action: none; user-select: none; }
.img-stage:active { cursor: grabbing; }
.img-stage.empty { cursor: default; }
.img-stage img { position: absolute; max-width: none; pointer-events: none; object-fit: cover; }
.img-stage.empty img { display: none; }
.img-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.img-line { display: flex; gap: 8px; align-items: center; }
.img-line .input { flex: 1; min-width: 0; }
.img-line .btn { flex: none; }
.img-zoom { display: flex; gap: 8px; align-items: center; }
.img-zoom[hidden] { display: none; }
.img-zoom input { flex: 1; min-width: 0; accent-color: var(--fg); }
.img-zoom output { min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; color: var(--fg2); }
.img-note:empty { display: none; }
`;

  // src/plugins/_core/settings/styles.ts
  var PANEL_CSS = `
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
.icon-btn.star.on { color: #e3a008; } .icon-btn.star.on svg { fill: currentColor; }
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
  var LAYER_CSS = `
.backdrop { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: auto; background: color-mix(in srgb, #000 30%, transparent); animation: fade .15s ease-out; }
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
.btn.danger-solid { background: var(--bad); color: #fff; } .btn.danger-solid:hover { opacity: .9; }

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

  // src/plugins/_core/settings/layer.ts
  var NATIVE_DIALOG = '[role="dialog"][data-perf-overlay="settings_modal"]';
  var L2 = {
    close: { zh: "关闭", en: "Close" },
    ok: { zh: "确定", en: "OK" },
    cancel: { zh: "取消", en: "Cancel" }
  };
  var shadow = null;
  var stack2 = [];
  function initLayer(scope) {
    shadow = shadowBox(LAYER_CSS + PANEL_CSS);
    shadow.host.dataset.ccpp = "layer";
    Object.assign(shadow.host.style, { inset: "0", zIndex: "2147483600", pointerEvents: "none" });
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, () => shadow?.sync());
    scope.listen(window, "keydown", (event) => {
      if (event.key !== "Escape" || !stack2.length || !shadow?.host.isConnected)
        return;
      event.preventDefault();
      event.stopPropagation();
      closeTop();
    }, { capture: true });
    scope.defer(() => {
      stack2.length = 0;
      shadow?.host.remove();
      shadow = null;
    });
  }
  function place2() {
    if (!shadow)
      return null;
    const dialog = document.querySelector(NATIVE_DIALOG);
    const parent = dialog ?? document.body;
    shadow.host.style.position = dialog ? "absolute" : "fixed";
    if (shadow.host.parentNode !== parent)
      parent.appendChild(shadow.host);
    shadow.sync();
    return shadow.box;
  }
  function closeTop() {
    const top = stack2.pop();
    top?.el.remove();
    top?.onClose?.();
  }
  function openModal(content, options = {}) {
    for (let i = stack2.length - 1;i >= 0; i--)
      if (!stack2[i].el.isConnected || stack2[i].el.getRootNode() !== shadow?.root)
        stack2.splice(i, 1);
    const box = place2();
    if (!box)
      return () => {};
    const backdrop = h("div", { class: `backdrop${options.backdrop === "clear" ? " clear" : ""}` }, content);
    backdrop.addEventListener("mousedown", (event) => event.target === backdrop && close());
    const layer = { el: backdrop, onClose: options.onClose };
    stack2.push(layer);
    box.appendChild(backdrop);
    queueMicrotask(() => content.querySelector("[autofocus], input, textarea, button:not(.icon-btn)")?.focus());
    function close() {
      const index = stack2.indexOf(layer);
      if (index < 0)
        return;
      stack2.splice(index, 1);
      backdrop.remove();
      layer.onClose?.();
    }
    return close;
  }
  function closeAllModals() {
    while (stack2.length)
      closeTop();
    if (shadow)
      clear(shadow.box);
  }
  function dialogFrame(options) {
    const close = h("button", { type: "button", class: "icon-btn", "aria-label": t(L2.close), ...tipAttrs(t(L2.close)) }, icon("x", 16));
    close.addEventListener("click", options.onClose);
    return h("div", { class: `dialog${options.size ? ` ${options.size}` : ""}`, role: "dialog", "aria-modal": "true", "aria-label": options.title }, h("div", { class: "d-head" }, options.icon ? h("span", { class: "chip-icon" }, icon(options.icon, 16)) : null, h("h2", { text: options.title }), close), options.top?.length ? h("div", { class: "d-top" }, ...options.top) : null, h("div", { class: "d-body" }, ...options.body), options.foot?.length ? h("div", { class: "d-foot" }, ...options.foot) : null);
  }
  function confirmDialog(options) {
    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled)
          return;
        settled = true;
        close();
        resolve(value);
      };
      const ok = h("button", { type: "button", class: `btn ${options.danger ? "danger-solid" : "primary"}`, text: t(options.ok ?? L2.ok) });
      ok.addEventListener("click", () => done(true));
      const cancel = h("button", { type: "button", class: "btn", text: t(options.cancel ?? L2.cancel) });
      cancel.addEventListener("click", () => done(false));
      const frame = dialogFrame({ title: options.title, size: "small", body: [h("p", { class: "d-desc", text: options.body })], foot: [cancel, ok], onClose: () => done(false) });
      const close = openModal(frame, { onClose: () => done(false) });
      queueMicrotask(() => ok.focus());
    });
  }

  // src/plugins/_core/settings/state.ts
  var version = "0.3.99";
  var tabs = new Map;
  var isPrefs = (v) => !!v && Array.isArray(v.favorites) && Array.isArray(v.pinned);
  var prefs = persisted("settings-ui", { favorites: [], pinned: [] }, isPrefs);
  var isFavorite = (name) => prefs.get().favorites.includes(name);
  var isPinned = (name) => prefs.get().pinned.includes(name);
  function toggleIn(key, name) {
    const current = prefs.get();
    const list = current[key].includes(name) ? current[key].filter((n) => n !== name) : [...current[key], name];
    prefs.set({ ...current, [key]: list });
  }
  var redrawers = new Set;
  function onRedraw(fn) {
    redrawers.add(fn);
    return () => void redrawers.delete(fn);
  }
  var queued = false;
  function redraw() {
    if (queued)
      return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      for (const fn of [...redrawers]) {
        try {
          fn();
        } catch {}
      }
    });
  }
  var view = {
    category: "",
    query: "",
    filter: "all",
    showApi: false
  };

  // src/plugins/_core/settings/nativeIcons.ts
  var SECTION_GLYPHS = {
    "settings/general": 57558,
    "settings/account": 57604,
    "settings/data-privacy-controls": 57507,
    "settings/billing": 57432,
    "settings/usage": 57648,
    "settings/capabilities": 57600,
    "settings/memory": 57512,
    "settings/design-systems": 57528,
    "settings/claude-code": 57416,
    "settings/browser-extension": 57433,
    "customize/skills/yours": 57554,
    "customize/connectors/yours": 57429,
    "customize/plugins/yours": 57541
  };
  var KEY = "native-icons";
  var learned = readJson(KEY, {});
  function sectionOf(sections, row) {
    const id = row.dataset.testid?.replace(/-settings$/, "").replace(/^customize-/, "");
    const byId = id && sections.find((s) => s.hash.split("/")[1] === id);
    if (byId)
      return byId.hash;
    const label = (row.textContent ?? "").replace(/[\ue000-\uf8ff]/g, "").trim().toLowerCase();
    return sections.find((s) => label === s.label.en.toLowerCase() || label === s.label.zh)?.hash ?? null;
  }
  var isGlyph = (text) => /^[-]$/.test(text);
  function learnNativeIcons(nav, sections) {
    let changed = false;
    for (const row of nav.querySelectorAll("li:not([data-ccpp-nav])")) {
      const text = row.querySelector('[data-cds="Icon"]')?.textContent ?? "";
      const hash = isGlyph(text) && sectionOf(sections, row);
      if (!hash || learned[hash] === text)
        continue;
      learned = { ...learned, [hash]: text };
      changed = true;
    }
    if (changed)
      writeJson(KEY, learned);
  }
  function sectionGlyph(hash) {
    const seen = learned[hash];
    if (seen && isGlyph(seen))
      return seen;
    const code = SECTION_GLYPHS[hash];
    return code ? String.fromCodePoint(code) : null;
  }

  // src/plugins/_core/settings/userMenu.ts
  var SETTINGS_ITEM = '[data-testid="user-menu-settings"]';
  var NATIVE_SECTIONS = [
    { hash: "settings/general", icon: "sliders", label: { zh: "通用", en: "General" } },
    { hash: "settings/account", icon: "user", label: { zh: "账户", en: "Account" } },
    { hash: "settings/data-privacy-controls", icon: "shield", label: { zh: "隐私", en: "Privacy" } },
    { hash: "settings/billing", icon: "creditCard", label: { zh: "账单", en: "Billing" } },
    { hash: "settings/usage", icon: "gauge", label: { zh: "用量", en: "Usage" } },
    { hash: "settings/capabilities", icon: "grid", label: { zh: "功能", en: "Capabilities" } },
    { hash: "settings/memory", icon: "brain", label: { zh: "记忆", en: "Memory" } },
    { hash: "settings/design-systems", icon: "palette", label: { zh: "设计系统", en: "Design systems" } },
    { hash: "settings/claude-code", icon: "terminal", label: { zh: "Claude Code", en: "Claude Code" } },
    { hash: "settings/browser-extension", icon: "globe", label: { zh: "Claude in Chrome", en: "Claude in Chrome" } },
    { hash: "customize/skills/yours", icon: "sparkles", label: { zh: "技能", en: "Skills" } },
    { hash: "customize/connectors/yours", icon: "link", label: { zh: "连接器", en: "Connectors" } },
    { hash: "customize/plugins/yours", icon: "puzzle", label: { zh: "插件（claude.ai）", en: "Plugins (claude.ai)" } }
  ];
  var L3 = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "打开 CC++ 设置", en: "Open CC++ settings" },
    openNative: { zh: "打开设置", en: "Open settings" },
    claude: { zh: "claude.ai", en: "claude.ai" }
  };
  function installUserMenu(scope, options) {
    watch(scope, SEL.menu, (menu) => {
      if (menu.hasAttribute("data-ccpp-panel-level"))
        return;
      let cleanup = null;
      const tryInsert = () => {
        if (cleanup)
          return true;
        const settingsItem = menu.querySelector(SETTINGS_ITEM);
        if (!settingsItem)
          return false;
        cleanup = enhance(menu, settingsItem, options);
        return true;
      };
      const observer = new MutationObserver(() => tryInsert() && observer.disconnect());
      if (!tryInsert())
        observer.observe(menu, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        cleanup?.();
      };
    });
  }
  function shortcutHint(settingsItem, keys) {
    if (!keys.length)
      return null;
    const native = settingsItem.querySelector('[data-cds="Shortcut"]');
    const sample = native?.querySelector("kbd");
    if (native && sample) {
      const hint = native.cloneNode(false);
      for (const key of keys) {
        const part = sample.cloneNode(true);
        const glyph = [...part.querySelectorAll("span")].find((el) => !el.matches(".sr-only")) ?? null;
        const name = part.querySelector(".sr-only");
        if (glyph)
          glyph.textContent = key;
        else
          part.textContent = key;
        if (name)
          name.textContent = KEY_NAMES[key] ?? key;
        hint.appendChild(part);
      }
      hint.setAttribute("data-ccpp-shortcut", "");
      return hint;
    }
    return h("span", { class: "shrink-0 text-muted text-footnote", "data-ccpp-shortcut": "", "aria-hidden": "true", text: keys.join(" "), style: { letterSpacing: ".08em" } });
  }
  var KEY_NAMES = { "⇧": "Shift", "⌘": "Command", "⌥": "Option", "⌃": "Control", ".": "Period", ",": "Comma" };
  function closeMenu(menu) {
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  }
  function enhance(menu, settingsItem, options) {
    const sampleSub = menu.querySelector('[role="menuitem"][aria-haspopup="menu"]');
    const itemClass = settingsItem.className;
    const subItemClass = sampleSub?.className ?? `${itemClass} justify-between data-[popup-open]:bg-fill-ghost-hover`;
    const iconSlot = settingsItem.firstElementChild;
    const separatorClass = menu.querySelector('[role="separator"]')?.className ?? "my-1 h-px bg-border";
    const panelClass = menu.className.replace(/\bw-\[[^\]]+\]/g, "");
    const scrollClass = menu.firstElementChild?.className ?? "";
    const added = [];
    const subLast = sampleSub?.lastElementChild;
    const nativeChevron = subLast && subLast !== sampleSub.firstElementChild && (subLast.matches('[data-cds="Icon"]') || subLast.querySelector('[data-cds="Icon"], svg')) ? subLast : null;
    const chevron = () => {
      const mark = nativeChevron?.cloneNode(true) ?? h("span", { class: "-mr-1 shrink-0 text-muted", style: { display: "inline-flex" } }, icon("chevronRight", 16));
      mark.setAttribute("data-ccpp-chevron", "");
      return mark;
    };
    const iconBox = (char, name) => {
      const box = iconSlot?.cloneNode(true) ?? h("span", { class: "flex size-icon shrink-0 items-center justify-center" });
      const native = box.querySelector('[data-cds="Icon"]');
      if (char && native) {
        native.textContent = char;
        native.removeAttribute("data-cds-mirror");
        return box;
      }
      box.textContent = "";
      if (char)
        box.appendChild(h("span", { "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } }));
      else
        box.appendChild(icon(name, 20, 1.75));
      return box;
    };
    const ownIcon = (name) => iconBox(glyph(name), name);
    const sectionIcon = (section) => iconBox(sectionGlyph(section.hash) ?? glyph(section.icon), section.icon);
    const row = (iconNode, label, opts = {}) => {
      const el = h("div", { role: "menuitem", tabindex: "-1", "data-cds-icon-row": "", "data-ccpp-item": "", class: opts.sub ? subItemClass : itemClass, style: { cursor: "pointer" } }, iconNode, typeof label === "string" ? h("span", { class: "min-w-0 flex-1 truncate", text: label }) : label, opts.trailing ?? null, opts.sub ? chevron() : null);
      if (opts.sub)
        el.setAttribute("aria-haspopup", "menu");
      el.addEventListener("pointerenter", () => highlight(el));
      el.addEventListener("pointerleave", () => el.removeAttribute("data-highlighted"));
      if (opts.run) {
        const run = opts.run;
        const activate = (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(menu);
          setTimeout(run, 0);
        };
        el.addEventListener("click", activate);
        el.addEventListener("keydown", (event) => (event.key === "Enter" || event.key === " ") && activate(event));
      }
      return el;
    };
    const caption = (text) => h("div", { class: "px-2.5 pt-2 pb-1 text-caption text-muted", style: { fontSize: "var(--cds-font-size-caption, 12px)", opacity: ".8" }, text });
    const separator = () => h("div", { role: "separator", class: separatorClass });
    const highlight = (el) => {
      for (const other of el.parentElement?.querySelectorAll("[data-highlighted]") ?? [])
        other.removeAttribute("data-highlighted");
      el.setAttribute("data-highlighted", "");
    };
    const panel = (anchor, container, width) => {
      const scroll = h("div", { class: scrollClass, style: { maxHeight: "min(calc(100vh - 16px), 32rem)", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--cds-alpha-2, rgba(127,127,127,.35)) transparent" } });
      const el = h("div", { role: "menu", "data-ccpp-panel-level": "", class: panelClass, style: { position: "absolute", width, zIndex: "1" } }, scroll);
      container.appendChild(el);
      const place = () => {
        const a = anchor.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        const gap = 4;
        if (window.innerWidth - c.right > el.offsetWidth + gap + 8)
          el.style.left = `calc(100% + ${gap}px)`;
        else
          el.style.right = `calc(100% + ${gap}px)`;
        const top = a.top - c.top - 4;
        const maxTop = window.innerHeight - c.top - el.offsetHeight - 8;
        el.style.top = `${Math.max(-c.top + 8, Math.min(top, maxTop))}px`;
      };
      el.addEventListener("pointerover", (event) => event.stopPropagation());
      return { el, scroll, place };
    };
    const level = (container) => {
      let open = null;
      const close = () => {
        if (!open)
          return;
        open.close();
        open.el.remove();
        open.trigger.removeAttribute("data-popup-open");
        open.trigger.setAttribute("aria-expanded", "false");
        open = null;
      };
      const attach = (trigger, width, fill) => {
        trigger.setAttribute("aria-haspopup", "menu");
        trigger.setAttribute("aria-expanded", "false");
        const show = () => {
          if (open?.trigger === trigger)
            return;
          close();
          const { el, scroll, place } = panel(trigger, container, width);
          const child = level(el);
          fill(scroll, child);
          place();
          scroll.addEventListener("pointerover", (event) => {
            const target = event.target.closest('[role="menuitem"]');
            if (target && !target.hasAttribute("aria-haspopup"))
              child.close();
          });
          trigger.setAttribute("data-popup-open", "");
          trigger.setAttribute("aria-expanded", "true");
          open = { trigger, el, close: child.close };
        };
        trigger.addEventListener("pointerenter", show);
        if (trigger.hasAttribute("data-ccpp-item")) {
          trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            show();
          });
        }
        trigger.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowRight")
            return;
          event.preventDefault();
          event.stopPropagation();
          show();
          open?.el.querySelector('[role="menuitem"]')?.focus();
        });
      };
      return { attach, close, isOpen: (trigger) => open?.trigger === trigger };
    };
    const top = level(menu);
    const fillPlugins = (scroll) => {
      for (const plugin of options.plugins()) {
        const dot = h("span", {
          class: "shrink-0",
          ...tipAttrs(isActive(plugin) ? "ON" : "OFF"),
          style: { width: "6px", height: "6px", borderRadius: "50%", marginInlineStart: "8px", background: isActive(plugin) ? "var(--cds-fill-accent, #2a78d6)" : "var(--cds-alpha-2, rgba(127,127,127,.4))" }
        });
        scroll.appendChild(row(ownIcon(plugin.icon ?? "puzzle"), t(plugin.title), { trailing: dot, run: () => options.openPlugin(plugin) }));
      }
    };
    const fillCcpp = (scroll, child) => {
      for (const tab of options.tabs()) {
        if (tab.id === "plugins") {
          const plugins = row(ownIcon(tab.icon), t(L3.plugins), { sub: true });
          child.attach(plugins, "16rem", fillPlugins);
          scroll.appendChild(plugins);
        } else
          scroll.appendChild(row(ownIcon(tab.icon), t(tab.title), { run: () => options.openTab(tab.id) }));
      }
    };
    if (options.settingsFlyout) {
      settingsItem.classList.add("justify-between");
      const mark = chevron();
      settingsItem.appendChild(mark);
      added.push(mark);
      top.attach(settingsItem, "15rem", (scroll, child) => {
        scroll.appendChild(row(ownIcon("settings"), t(L3.openNative), { run: () => location.hash = "settings/general" }));
        scroll.appendChild(separator());
        scroll.appendChild(caption("CC++"));
        fillCcpp(scroll, child);
        scroll.appendChild(separator());
        scroll.appendChild(caption(t(L3.claude)));
        for (const section of NATIVE_SECTIONS)
          scroll.appendChild(row(sectionIcon(section), t(section.label), { run: () => location.hash = section.hash }));
      });
    }
    if (options.entry) {
      const name = h("span", { class: "min-w-0 flex-1 truncate" }, "CC++", h("span", { class: "text-muted", "data-ccpp-version": "", text: ` v${version}`, style: { fontSize: "var(--cds-font-size-caption, 12px)", lineHeight: "1", verticalAlign: "middle", marginInlineStart: "4px" } }));
      const entry = row(ownIcon("plug"), name, { sub: true, trailing: shortcutHint(settingsItem, options.shortcut) });
      top.attach(entry, "14rem", (scroll, child) => {
        fillCcpp(scroll, child);
        scroll.appendChild(separator());
        scroll.appendChild(row(ownIcon("settings"), t(L3.openSettings), { run: () => options.openTab("plugins") }));
      });
      settingsItem.after(entry);
      added.push(entry);
    }
    const onOver = (event) => {
      const target = event.target.closest('[role="menuitem"]');
      if (target && target !== settingsItem && !target.hasAttribute("data-ccpp-item"))
        top.close();
    };
    menu.addEventListener("pointerover", onOver);
    return () => {
      top.close();
      menu.removeEventListener("pointerover", onOver);
      for (const el of added)
        el.remove();
    };
  }

  // src/plugins/_core/settings/native.ts
  var NAV = '[data-perf-region="settings_nav"]';
  var HASH = "#settings/ccpp-";
  var bootHash = typeof location === "object" ? location.hash : "";
  var hashTab = (hash) => hash.startsWith(HASH) ? hash.slice(HASH.length) : null;
  var PANEL = '[data-perf-region="settings_panel"]';
  var L4 = {
    group: "CC++",
    close: { zh: "关闭", en: "Close" }
  };
  var DOC_CSS = `
[data-ccpp-panel] > :not(:first-child):not([data-ccpp-host]) { display: none !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current] { background: transparent !important; font-weight: inherit !important; color: var(--cds-text-secondary, inherit) !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current]:hover { background: var(--cds-fill-ghost-hover, transparent) !important; color: var(--cds-text-primary, inherit) !important; }
[data-ccpp-host] { display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0; min-width: 0; height: 100%; max-height: 100%; }
[data-ccpp-nav-head] { display: flex !important; align-items: baseline; gap: 6px; }
[data-ccpp-nav-version] { opacity: .7; font-size: .92em; font-variant-numeric: tabular-nums; }
`;
  function nativeGlyph(name, cls) {
    const char = glyph(name);
    if (char)
      return h("span", { class: cls, "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } });
    return h("span", { class: cls, "aria-hidden": "true", style: { display: "inline-flex", width: "1.25rem", justifyContent: "center" } }, icon(name, 18));
  }
  var sortedTabs = () => [...tabs.values()].sort((a, b) => a.order - b.order);
  function renderPage(tab, box) {
    const previous = box.querySelector(".page-body");
    const scrollTop = previous?.scrollTop ?? 0;
    const sameTab = box.dataset.tab === tab.id;
    clear(box);
    box.dataset.tab = tab.id;
    const body = h("div", { class: "page-body" });
    box.appendChild(h("div", { class: "page" }, h("div", { class: "page-head" }, h("h2", { text: t(tab.title) })), body));
    try {
      tab.render(body);
    } catch (error) {
      body.appendChild(h("div", { class: "banner", text: String(error) }));
    }
    if (sameTab)
      body.scrollTop = scrollTop;
  }
  var mounted = null;
  var pendingTab = null;
  var nativeOpen = () => !!mounted && !!document.querySelector(NATIVE_DIALOG);
  var navPosition = () => "below";
  function installNative(scope, position) {
    navPosition = position;
    addStyle(scope, DOC_CSS, "settings-native");
    watch(scope, NATIVE_DIALOG, (dialog) => {
      let active = null;
      const shadow = shadowBox(PANEL_CSS);
      shadow.host.dataset.ccppHost = "";
      shadow.box.style.height = "100%";
      let classes = null;
      const nav = () => dialog.querySelector(NAV);
      const panel = () => dialog.querySelector(PANEL);
      const learnClasses = (root) => {
        if (classes)
          return classes;
        const on = root.querySelector("li:not([data-ccpp-nav]) > button[aria-current]");
        const off = root.querySelector("li:not([data-ccpp-nav]) > button:not([aria-current])");
        const header = root.querySelector("ul[aria-labelledby]")?.previousElementSibling;
        const list = root.querySelector("ul");
        if (!off || !list)
          return null;
        const fallbackOn = `${off.className.replace(/\btext-secondary\S*/g, "").replace(/\bhover:\S+/g, "")} bg-fill-ghost-selected font-medium text-primary`;
        classes = {
          header: header?.className || "px-sm pt-md text-caption text-muted",
          list: list.className,
          on: on?.className || fallbackOn,
          off: off.className,
          icon: off.querySelector("span[data-cds]")?.className || "shrink-0",
          label: off.querySelector("span:last-child")?.className || "min-w-0 flex-1 truncate"
        };
        return classes;
      };
      const paintNav = () => {
        const root = nav();
        if (!root)
          return;
        learnNativeIcons(root, NATIVE_SECTIONS);
        const c = learnClasses(root);
        if (!c)
          return;
        const scroller = root.querySelector("ul")?.parentElement;
        if (!scroller)
          return;
        let group = [...scroller.children].find((el) => el.hasAttribute("data-ccpp-nav-group"));
        const list = sortedTabs();
        if (!group || group.dataset.tabs !== list.map((tab) => tab.id).join(",") || group.dataset.lang !== t({ zh: "zh", en: "en" })) {
          group?.remove();
          const ul = h("ul", { class: c.list, "aria-label": L4.group });
          for (const tab of list) {
            const button = h("button", { type: "button", class: c.off, "data-tab": tab.id }, nativeGlyph(tab.icon, c.icon), h("span", { class: c.label, text: t(tab.title) }));
            button.addEventListener("click", (event) => {
              event.preventDefault();
              activate(tab.id);
            });
            ul.appendChild(h("li", { "data-ccpp-nav": tab.id }, button));
          }
          group = h("div", { "data-ccpp-nav-group": "", "data-tabs": list.map((tab) => tab.id).join(","), "data-lang": t({ zh: "zh", en: "en" }), style: { display: "contents" } }, h("div", { class: c.header, "data-ccpp-nav-head": "" }, h("span", { text: L4.group }), h("span", { "data-ccpp-nav-version": "", text: `v${version}` })), ul);
          scroller.appendChild(group);
        }
        const wantFirst = navPosition() === "above";
        if (wantFirst ? scroller.firstElementChild !== group : scroller.lastElementChild !== group) {
          if (wantFirst)
            scroller.prepend(group);
          else
            scroller.appendChild(group);
        }
        for (const button of group.querySelectorAll("button[data-tab]")) {
          const on = button.dataset.tab === active;
          const want = on ? c.on : c.off;
          if (button.className !== want)
            button.className = want;
          if (on)
            button.setAttribute("aria-current", "page");
          else
            button.removeAttribute("aria-current");
        }
        root.toggleAttribute("data-ccpp-active", !!active);
      };
      const paintPanel = () => {
        const target = panel();
        if (!target)
          return;
        target.toggleAttribute("data-ccpp-panel", !!active);
        if (!active) {
          shadow.host.remove();
          return;
        }
        if (shadow.host.parentNode !== target)
          target.appendChild(shadow.host);
      };
      const draw = () => {
        const tab = active ? tabs.get(active) : null;
        if (active && !tab)
          active = null;
        paintNav();
        paintPanel();
        if (tab)
          renderPage(tab, shadow.box);
      };
      function activate(id) {
        if (!tabs.has(id))
          return;
        active = id;
        if (location.hash !== HASH + id) {
          try {
            history.pushState(history.state, "", HASH + id);
          } catch {}
        }
        shadow.sync();
        draw();
        shadow.box.querySelector(".page-body")?.scrollTo(0, 0);
      }
      const deactivate = () => {
        if (!active)
          return;
        active = null;
        draw();
      };
      let frame = 0;
      const observer = new MutationObserver(() => {
        if (frame)
          return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          paintNav();
          paintPanel();
        });
      });
      observer.observe(dialog, { childList: true, subtree: true });
      const onClick = (event) => {
        const target = event.target;
        if (target?.closest?.(`${NAV} li:not([data-ccpp-nav]), ${NAV} [role="option"]`))
          deactivate();
      };
      dialog.addEventListener("click", onClick, true);
      const onHash = () => {
        const id = hashTab(location.hash);
        if (id && tabs.has(id))
          activate(id);
        else
          deactivate();
      };
      window.addEventListener("hashchange", onHash);
      const offRedraw = onRedraw(() => active && draw());
      const self = { activate };
      mounted = self;
      paintNav();
      if (pendingTab) {
        const id = pendingTab;
        pendingTab = null;
        requestAnimationFrame(() => activate(id));
      }
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        dialog.removeEventListener("click", onClick, true);
        window.removeEventListener("hashchange", onHash);
        offRedraw();
        shadow.host.remove();
        nav()?.removeAttribute("data-ccpp-active");
        panel()?.removeAttribute("data-ccpp-panel");
        dialog.querySelector("[data-ccpp-nav-group]")?.remove();
        if (mounted === self)
          mounted = null;
        if (hashTab(location.hash)) {
          try {
            history.replaceState(history.state, "", location.pathname + location.search);
          } catch {}
        }
      };
    });
    scope.defer(() => {
      mounted = null;
      pendingTab = null;
    });
    const fromHash = (hash) => {
      const id = hashTab(hash);
      if (id && tabs.has(id) && !nativeOpen())
        openNative(id);
    };
    scope.listen(window, "hashchange", () => fromHash(location.hash));
    if (hashTab(bootHash))
      setTimeout(() => fromHash(bootHash), 500);
  }
  function openNative(tab) {
    if (nativeOpen()) {
      mounted.activate(tab);
      return Promise.resolve(true);
    }
    pendingTab = tab;
    location.hash = "settings/general";
    return new Promise((resolve) => {
      const started = Date.now();
      const check = () => {
        if (pendingTab !== tab)
          return resolve(true);
        if (Date.now() - started > 2000) {
          pendingTab = null;
          return resolve(false);
        }
        setTimeout(check, 100);
      };
      setTimeout(check, 100);
    });
  }
  var standaloneClose = null;
  function openStandalone(tabId) {
    standaloneClose?.();
    let current = tabs.has(tabId) ? tabId : sortedTabs()[0]?.id;
    const nav = h("nav", { class: "shell-nav" }, h("div", { class: "group" }, L4.group, h("span", { class: "ver", text: ` v${version}` })));
    const main = h("div", { class: "shell-main" });
    const pageBox = h("div", { style: { flex: "1", minHeight: "0", display: "flex", flexDirection: "column" } });
    const closeBtn = h("button", { type: "button", class: "icon-btn", "aria-label": t(L4.close), ...tipAttrs(t(L4.close)) }, icon("x", 16));
    main.append(h("div", { class: "shell-top" }, closeBtn), pageBox);
    const draw = () => {
      for (const old of nav.querySelectorAll("button"))
        old.remove();
      for (const tab of sortedTabs()) {
        const button = h("button", { type: "button", class: tab.id === current ? "active" : "" }, icon(tab.icon, 16), t(tab.title));
        button.addEventListener("click", () => {
          current = tab.id;
          draw();
        });
        nav.appendChild(button);
      }
      const tab = current ? tabs.get(current) : null;
      if (tab)
        renderPage(tab, pageBox);
    };
    const shell = h("div", { class: "shell", role: "dialog", "aria-modal": "true", "aria-label": "CC++" }, nav, main);
    draw();
    const offRedraw = onRedraw(draw);
    const close = openModal(shell, {
      onClose: () => {
        offRedraw();
        standaloneClose = null;
      }
    });
    closeBtn.addEventListener("click", close);
    standaloneClose = close;
  }
  var standaloneOpen = () => !!standaloneClose;
  var closeStandalone = () => standaloneClose?.();

  // src/plugins/_core/settings/options.ts
  function renderOption(settings, key, option, rerender) {
    const owner = settings.owner();
    const values = {};
    for (const [k, def] of Object.entries(settings.def))
      values[k] = coerce(def, getRaw(owner, k));
    if (option.visible && !option.visible(values))
      return null;
    const value = values[key];
    const set = (next) => {
      setRaw(owner, key, next);
      if (Object.values(settings.def).some((def) => def.visible))
        rerender();
    };
    const text = h("div", { class: "row-text" }, h("div", { class: "row-title", text: t(option.label) }), option.description ? h("div", { class: "row-desc", text: t(option.description) }) : null);
    const row = (control, wide = false) => h("div", { class: `row${wide ? " wide" : ""}`, "data-key": key }, text, wide ? control : h("div", { class: "row-control" }, control));
    switch (option.type) {
      case "boolean": {
        const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(value), "aria-label": t(option.label) });
        sw.addEventListener("click", () => {
          const next = sw.getAttribute("aria-checked") !== "true";
          sw.setAttribute("aria-checked", String(next));
          set(next);
        });
        return row(sw);
      }
      case "number": {
        const output = h("output", { text: `${value}${option.unit ?? ""}` });
        const input = h("input", { type: "range", min: option.min, max: option.max, step: option.step ?? 1, value: String(value), "aria-label": t(option.label) });
        const label = `${t({ zh: "恢复默认", en: "Reset to default" })} (${option.default}${option.unit ?? ""})`;
        const reset = h("button", { type: "button", class: "icon-btn", ...tipAttrs(label), "aria-label": label, disabled: value === option.default }, icon("refresh", 14));
        input.addEventListener("input", () => {
          output.textContent = `${input.value}${option.unit ?? ""}`;
          reset.disabled = Number(input.value) === option.default;
        });
        input.addEventListener("change", () => set(Number(input.value)));
        reset.addEventListener("click", () => {
          input.value = String(option.default);
          output.textContent = `${option.default}${option.unit ?? ""}`;
          reset.disabled = true;
          set(option.default);
        });
        return row(h("div", { class: "range" }, input, output, reset));
      }
      case "select": {
        const select = h("select", { class: "input", "aria-label": t(option.label) }, ...option.options.map((o) => h("option", { value: o.value, text: t(o.label), selected: o.value === value })));
        select.addEventListener("change", () => set(select.value));
        return row(select);
      }
      case "color": {
        const input = h("input", { type: "color", value: String(value), "aria-label": t(option.label) });
        input.addEventListener("change", () => set(input.value));
        return row(input);
      }
      case "string": {
        const input = h("input", { class: "input", value: String(value ?? ""), placeholder: option.placeholder ? t(option.placeholder) : "", maxLength: option.maxLength ?? 2000, "aria-label": t(option.label) });
        input.addEventListener("change", () => set(input.value));
        return row(input, true);
      }
      case "text": {
        const area = h("textarea", { class: "input", rows: option.rows ?? 5, placeholder: option.placeholder ? t(option.placeholder) : "", "aria-label": t(option.label) });
        area.value = String(value ?? "");
        area.addEventListener("change", () => set(area.value));
        return row(area, true);
      }
      case "image":
        return row(imageField(option, String(value ?? ""), (next) => set(next)), true);
      case "action": {
        const button = h("button", { type: "button", class: "btn", text: t(option.button) });
        button.addEventListener("click", async () => {
          if (option.confirm && !await confirmDialog({ title: t(option.label), body: t(option.confirm), danger: true }))
            return;
          option.run();
        });
        return row(button);
      }
    }
  }

  // src/plugins/_core/settings/pluginsTab.ts
  var CATEGORY_LABELS = {
    favorites: { zh: "收藏", en: "Favorites" },
    recent: { zh: "最近", en: "Recent" },
    all: { zh: "全部", en: "All" },
    composer: { zh: "输入框", en: "Composer" },
    messages: { zh: "消息", en: "Messages" },
    chats: { zh: "对话", en: "Chats" },
    media: { zh: "媒体", en: "Media" },
    navigation: { zh: "导航", en: "Navigation" },
    notifications: { zh: "通知", en: "Notifications" },
    appearance: { zh: "外观", en: "Appearance" },
    declutter: { zh: "精简", en: "Declutter" },
    privacy: { zh: "隐私", en: "Privacy" },
    developer: { zh: "开发者", en: "Developer" }
  };
  var CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
  var L5 = {
    search: { zh: "搜索 {n} 个插件…", en: "Search {n} plugins…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    reloadBanner: { zh: "有插件需要刷新页面才能完全生效：", en: "Reload the page to fully apply: " },
    reload: { zh: "刷新", en: "Reload" },
    later: { zh: "稍后", en: "Later" },
    reloadTitle: { zh: "需要刷新", en: "Reload required" },
    reloadBody: { zh: "「{name}」要刷新页面后才能完全生效。现在刷新吗？", en: "“{name}” fully applies after a reload. Reload now?" },
    empty: { zh: "没有匹配的插件", en: "No matching plugins" },
    noFavorites: { zh: "还没有收藏的插件", en: "No favorites yet" },
    noFavoritesHint: { zh: "点插件卡片上的 ☆ 收藏，常用的插件会出现在这里。", en: "Star a plugin card and it shows up here." },
    noRecent: { zh: "最近 7 天没有新增或更新的插件", en: "Nothing new or updated in the last 7 days" },
    required: { zh: "必需插件", en: "Required" },
    favorite: { zh: "收藏", en: "Favorite" },
    pin: { zh: "置顶", en: "Pin" },
    configure: { zh: "设置", en: "Settings" },
    newBadge: { zh: "NEW", en: "NEW" },
    updated: { zh: "最近更新", en: "Updated" },
    needsReload: { zh: "需刷新", en: "Reload" },
    crashed: { zh: "出错", en: "Crashed" },
    keptBy: { zh: "被这些插件需要，保持开启：", en: "Kept on by: " },
    settings: { zh: "设置", en: "Settings" },
    noOptions: { zh: "这个插件没有可调的选项。", en: "This plugin has no options." },
    reset: { zh: "重置设置", en: "Reset settings" },
    resetTitle: { zh: "重置设置？", en: "Reset settings?" },
    resetBody: { zh: "「{name}」的所有选项会恢复默认值。", en: "Every option of “{name}” goes back to its default." },
    resetOk: { zh: "重置", en: "Reset" },
    author: { zh: "作者", en: "By" },
    dependsOn: { zh: "依赖", en: "Needs" }
  };
  var fill2 = (text, name) => t(text).replace("{name}", name);
  var authorOf = (plugin) => plugin.authors?.join(", ") || "CC++";
  var listedPlugins = () => allPlugins().filter((p) => view.showApi || !(p.hidden || p.category === "api"));
  function matchesQuery(plugin, query) {
    if (!query)
      return true;
    const hay = [plugin.name, t(plugin.title), t(plugin.description), ...Object.values(plugin.settings?.def ?? {}).map((o) => t(o.label))].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
  }
  function inCategory(plugin, category) {
    if (category === "all")
      return true;
    if (category === "favorites")
      return isFavorite(plugin.name);
    if (category === "recent")
      return isRecent(plugin);
    return plugin.category === category || !!plugin.tags?.includes(category);
  }
  function passesFilter(plugin) {
    if (view.filter === "enabled")
      return isActive(plugin);
    if (view.filter === "disabled")
      return !isActive(plugin);
    return true;
  }
  var hasOptions = (plugin) => !!plugin.settings && Object.values(plugin.settings.def).length > 0;
  async function togglePlugin(plugin, on) {
    setEnabled(plugin, on);
    if (!plugin.restartNeeded)
      return;
    const reload = await confirmDialog({ title: t(L5.reloadTitle), body: fill2(L5.reloadBody, t(plugin.title)), ok: L5.reload, cancel: L5.later });
    if (reload)
      location.reload();
  }
  function pluginSwitch(plugin) {
    const enabled = isEnabled(plugin);
    const keptBy = !enabled ? activeDependents(plugin.name) : [];
    const sw = h("button", {
      type: "button",
      class: "switch",
      role: "switch",
      "aria-checked": String(isActive(plugin)),
      "aria-label": t(plugin.title),
      disabled: !!plugin.required || keptBy.length > 0,
      ...keptBy.length ? tipAttrs(t(L5.keptBy) + keptBy.map((p) => t(p.title)).join(", ")) : {}
    });
    sw.addEventListener("click", () => togglePlugin(plugin, !enabled));
    return sw;
  }
  function badges(plugin) {
    const out = [];
    if (isNew(plugin.name))
      out.push(h("span", { class: "badge accent", text: t(L5.newBadge) }));
    else if (isRecent(plugin))
      out.push(h("span", { class: "badge", text: t(L5.updated) }));
    if (pendingRestart().includes(plugin))
      out.push(h("span", { class: "badge accent", text: t(L5.needsReload) }));
    if (pluginError(plugin.name))
      out.push(h("span", { class: "badge bad", text: t(L5.crashed) }));
    return out;
  }
  function pluginCard(plugin) {
    const error = pluginError(plugin.name);
    const iconBtn = (cls, label, name, on, run) => {
      const button = h("button", { type: "button", class: `icon-btn ${cls}${on ? " on" : ""}`, ...tipAttrs(t(label)), "aria-label": t(label), "aria-pressed": String(on) }, icon(name, 14));
      button.addEventListener("click", run);
      return button;
    };
    const title = h("span", { class: "card-title", text: t(plugin.title), ...tipAttrs(plugin.name) });
    title.addEventListener("click", () => openPluginDialog(plugin));
    return h("div", { class: `card${isActive(plugin) ? " on" : " off"}${error ? " crashed" : ""}`, "data-plugin": plugin.name, ...error ? tipAttrs(t(L5.crashed), `${error.stage}: ${error.message}`) : {} }, h("div", { class: "card-body" }, h("div", { class: "card-top" }, h("span", { class: "chip-icon" }, icon(plugin.icon ?? "puzzle", 14)), title, h("div", { class: "card-actions" }, iconBtn("star", L5.favorite, "star", isFavorite(plugin.name), () => toggleIn("favorites", plugin.name)), iconBtn("pin", L5.pin, "pin", isPinned(plugin.name), () => toggleIn("pinned", plugin.name)), hasOptions(plugin) ? iconBtn("cfg", L5.configure, "sliders", false, () => openPluginDialog(plugin)) : null, pluginSwitch(plugin))), h("div", { class: "card-desc", text: t(plugin.description) }), h("div", { class: "card-gap" }), h("div", { class: "card-foot" }, ...badges(plugin), h("span", { class: "author", text: authorOf(plugin) }))));
  }
  var sortPlugins = (list) => list.sort((a, b) => Number(isPinned(b.name)) - Number(isPinned(a.name)) || Number(isFavorite(b.name)) - Number(isFavorite(a.name)) || t(a.title).localeCompare(t(b.title)));
  function defaultCategory() {
    return prefs.get().favorites.some((name) => getPlugin(name)) ? "favorites" : "all";
  }
  function renderPluginsTab(container) {
    if (!view.category)
      view.category = defaultCategory();
    const plugins = listedPlugins();
    const categories = CATEGORY_ORDER.filter((cat) => ["favorites", "recent", "all"].includes(cat) || plugins.some((p) => inCategory(p, cat)));
    const tabBar = h("div", { class: "tabs", role: "tablist" });
    const searchLabel = () => t(L5.search).replace("{n}", String(plugins.filter((p) => inCategory(p, view.category)).length));
    const search = h("input", { class: "input", type: "search", placeholder: searchLabel(), value: view.query, "aria-label": searchLabel() });
    for (const cat of categories) {
      const button = h("button", { type: "button", role: "tab", class: view.category === cat ? "active" : "", "aria-selected": String(view.category === cat) }, t(CATEGORY_LABELS[cat]));
      button.addEventListener("click", () => {
        view.category = cat;
        for (const other of tabBar.children)
          other.classList.toggle("active", other === button), other.setAttribute("aria-selected", String(other === button));
        search.placeholder = searchLabel();
        search.setAttribute("aria-label", searchLabel());
        renderList();
      });
      tabBar.appendChild(button);
    }
    search.addEventListener("input", () => {
      view.query = search.value;
      renderList();
    });
    const filter = h("select", { class: "input", "aria-label": t(L5.all) }, ...["all", "enabled", "disabled"].map((value) => h("option", { value, text: t(L5[value]), selected: view.filter === value })));
    filter.addEventListener("change", () => {
      view.filter = filter.value;
      renderList();
    });
    container.appendChild(h("div", { class: "sticky-top" }, tabBar, h("div", { class: "bar" }, h("label", { class: "search" }, icon("search", 14), search), filter)));
    const pending = pendingRestart();
    if (pending.length) {
      const reload = h("button", { type: "button", class: "btn primary", text: t(L5.reload) });
      reload.addEventListener("click", () => location.reload());
      container.appendChild(h("div", { class: "banner" }, icon("alert", 16), h("span", { text: t(L5.reloadBanner) + pending.map((p) => t(p.title)).join(t({ zh: "、", en: ", " })) }), reload));
    }
    const list = h("div");
    container.appendChild(list);
    function renderList() {
      clear(list);
      const shown = plugins.filter((p) => (view.query ? true : inCategory(p, view.category)) && matchesQuery(p, view.query) && passesFilter(p));
      if (!shown.length) {
        const [title, hint] = view.category === "favorites" && !view.query ? [L5.noFavorites, L5.noFavoritesHint] : view.category === "recent" && !view.query ? [L5.noRecent, null] : [L5.empty, null];
        list.appendChild(h("div", { class: "empty" }, h("b", { text: t(title) }), hint ? t(hint) : null));
        return;
      }
      const splitRequired = view.category === "all" && !view.query;
      const main = sortPlugins(shown.filter((p) => !splitRequired || !p.required));
      const required = splitRequired ? sortPlugins(shown.filter((p) => p.required)) : [];
      if (main.length)
        list.appendChild(h("div", { class: "grid" }, ...main.map(pluginCard)));
      if (required.length)
        list.append(h("div", { class: "sep", text: t(L5.required) }), h("div", { class: "grid" }, ...required.map(pluginCard)));
    }
    renderList();
  }
  function openPluginDialog(plugin) {
    const body = h("div");
    const draw = () => {
      clear(body);
      const meta = h("div", { class: "d-meta" }, ...badges(plugin), h("span", { text: `${t(L5.author)} ${authorOf(plugin)}` }));
      if (plugin.dependencies?.length && view.showApi)
        meta.appendChild(h("span", { text: `· ${t(L5.dependsOn)} ${plugin.dependencies.join(", ")}` }));
      const top = h("div", { class: "row" }, h("div", { class: "row-text" }, h("p", { class: "d-desc", text: t(plugin.description) }), meta), h("div", { class: "row-control" }, pluginSwitch(plugin)));
      const error = pluginError(plugin.name);
      body.append(top);
      if (error)
        body.appendChild(h("div", { class: "banner" }, icon("alert", 16), h("span", { text: `${error.stage}: ${error.message}` })));
      body.appendChild(h("div", { class: "d-sep" }));
      body.appendChild(h("div", { class: "d-title", text: t(L5.settings) }));
      if (!hasOptions(plugin)) {
        body.appendChild(h("p", { class: "muted", text: t(L5.noOptions) }));
        return;
      }
      const rows = Object.entries(plugin.settings.def).map(([key, option]) => renderOption(plugin.settings, key, option, draw)).filter(Boolean);
      body.appendChild(h("div", { class: "rows" }, ...rows));
    };
    draw();
    const reset = h("button", { type: "button", class: "btn danger", text: t(L5.reset), disabled: !hasOptions(plugin) });
    reset.addEventListener("click", async () => {
      if (!await confirmDialog({ title: t(L5.resetTitle), body: fill2(L5.resetBody, t(plugin.title)), ok: L5.resetOk, danger: true }))
        return;
      plugin.settings.reset();
      draw();
    });
    let close = () => {};
    const frame = dialogFrame({ title: t(plugin.title), icon: plugin.icon ?? "puzzle", body: [body], foot: [reset, h("span", { class: "grow" })], onClose: () => close() });
    const offSettings = onSettingsChange((name) => name === plugin.name && refreshHead());
    const offRedraw = onRedraw(refreshHead);
    function refreshHead() {
      const top = body.querySelector(":scope > .row");
      const fresh = h("div", { class: "row-control" }, pluginSwitch(plugin));
      top?.querySelector(".row-control")?.replaceWith(fresh);
    }
    close = openModal(frame, {
      onClose: () => {
        offSettings();
        offRedraw();
      }
    });
  }
  // src/plugins/_core/settings/index.ts
  var L6 = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "CC++ 设置", en: "CC++ settings" }
  };
  function registerTab(scope, tab) {
    tabs.set(tab.id, tab);
    scope.defer(() => {
      if (tabs.get(tab.id) === tab)
        tabs.delete(tab.id);
      redraw();
    });
    redraw();
  }
  var settings = definePluginSettings({
    language: {
      type: "select",
      label: { zh: "界面语言", en: "Language" },
      default: "auto",
      options: [
        { value: "auto", label: { zh: "跟随 claude.ai", en: "Follow claude.ai" } },
        { value: "zh", label: "中文" },
        { value: "en", label: "English" }
      ]
    },
    nativeDialog: {
      type: "boolean",
      label: { zh: "放进 claude.ai 的设置弹窗", en: "Live inside claude.ai's settings dialog" },
      description: { zh: "关闭后用独立弹窗。", en: "Off uses a separate dialog." },
      default: true
    },
    navPosition: {
      type: "select",
      label: { zh: "CC++ 分组位置", en: "CC++ group position" },
      default: "below",
      options: [
        { value: "below", label: { zh: "下方", en: "Below" } },
        { value: "above", label: { zh: "上方", en: "Above" } }
      ]
    },
    userMenuEntry: { type: "boolean", label: { zh: "头像菜单里的 CC++ 子菜单", en: "CC++ submenu in the account menu" }, default: true },
    settingsFlyout: { type: "boolean", label: { zh: "头像菜单的「设置」展开成子菜单", en: "Account-menu Settings opens a submenu" }, description: { zh: "悬停展开，点击仍打开设置。", en: "Hover to expand; click still opens settings." }, default: true },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "如 mod+shift+.，留空关闭。", en: "e.g. mod+shift+.; empty disables." }, default: "mod+shift+." },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示 CC++ 按钮", en: "CC++ button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, default: false }
  });
  var isSettingsOpen = () => nativeOpen() || standaloneOpen();
  async function openSettings(options = {}) {
    const plugin = options.plugin ? getPlugin(options.plugin) : undefined;
    if (plugin) {
      view.category = "all";
      view.query = "";
    }
    const tab = plugin ? "plugins" : options.tab && tabs.has(options.tab) ? options.tab : "plugins";
    let shown = false;
    if (settings.store.nativeDialog)
      shown = await openNative(tab);
    if (!shown)
      openStandalone(tab);
    if (plugin)
      openPluginDialog(plugin);
  }
  function closeSettings() {
    closeAllModals();
    closeStandalone();
    if (nativeOpen())
      document.querySelector('[data-perf-region="settings_panel"] button[aria-label]')?.click();
  }
  var entries = null;
  function installEntries(parent) {
    entries?.dispose();
    const scope = entries = parent.child();
    if (settings.store.userMenuEntry || settings.store.settingsFlyout) {
      installUserMenu(scope, {
        entry: settings.store.userMenuEntry,
        settingsFlyout: settings.store.settingsFlyout,
        shortcut: settings.store.hotkey.trim() ? comboKeys(settings.store.hotkey) : [],
        tabs: sortedTabs,
        plugins: () => listedPlugins().sort((a, b) => t(a.title).localeCompare(t(b.title))),
        openTab: (tab) => openSettings({ tab }),
        openPlugin: (plugin) => openPluginDialog(plugin)
      });
    }
    const toggle = () => isSettingsOpen() ? closeSettings() : openSettings();
    if (settings.store.hotkey.trim())
      bindKey(scope, settings.store.hotkey, toggle, { inInputs: true });
    addMenuCommand(scope, `⚙️ ${t(L6.openSettings)}${settings.store.hotkey ? ` (${comboLabel(settings.store.hotkey)})` : ""}`, () => openSettings());
    if (settings.store.composerEntry)
      addSlotItem(scope, "composer", "settings", () => slotButton(t(L6.openSettings), () => openSettings(), icon("plug", 16)), 100);
  }
  var settings_default = definePlugin({
    name: "Settings",
    title: { zh: "设置面板", en: "Settings" },
    description: {
      zh: "CC++ 的设置界面本身也是插件：claude.ai 设置侧栏里的 CC++ 分组、头像菜单子菜单、插件卡片（收藏、置顶、单插件设置弹窗）。",
      en: "The CC++ settings UI, itself a plugin: the CC++ group in claude.ai's settings sidebar, the account-menu submenu, and plugin cards with favorites, pins and per-plugin dialogs."
    },
    category: "core",
    icon: "settings",
    required: true,
    dependencies: ["DomApi", "HotkeysApi", "MenuApi", "SlotsApi", "StylesApi"],
    settings,
    start(scope) {
      setLang(settings.store.language);
      view.showApi = settings.store.showApiPlugins;
      registerTab(scope, { id: "plugins", title: L6.plugins, icon: "puzzle", order: 0, render: renderPluginsTab });
      initLayer(scope);
      installNative(scope, () => settings.store.navPosition === "above" ? "above" : "below");
      scope.defer(onPluginStateChange(redraw));
      scope.defer(onSettingsChange((_, key) => key === "enabled" && redraw()));
      scope.defer(prefs.subscribe(redraw));
      installEntries(scope);
    },
    onSettingsChange(key, scope) {
      if (key === "language")
        setLang(settings.store.language);
      if (key === "showApiPlugins")
        view.showApi = settings.store.showApiPlugins;
      if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry" || key === "settingsFlyout")
        installEntries(scope);
      redraw();
    }
  });

  // src/plugins/_core/backup/index.ts
  var L7 = {
    title: { zh: "备份", en: "Backup" },
    backupHint: { zh: "导出全部 CC++ 数据（插件开关、选项、收藏的消息、输入历史、自定义 CSS），可在另一台电脑导入。", en: "Export all CC++ data (switches, options, starred messages, prompt history, Quick CSS) to restore elsewhere." },
    export: { zh: "导出 JSON", en: "Export JSON" },
    import: { zh: "导入 JSON", en: "Import JSON" },
    reset: { zh: "清空全部数据", en: "Erase all data" },
    resetConfirm: { zh: "清空 CC++ 的全部设置与数据？此操作不可撤销。", en: "Erase every CC++ setting and data? This cannot be undone." },
    imported: { zh: "已导入，部分插件可能需要刷新页面。", en: "Imported. Some plugins may need a reload." },
    bad: { zh: "文件不是 CC++ 备份。", en: "That file is not a CC++ backup." }
  };
  var FORMAT = "ccpp-backup";
  function buildBackup() {
    return { format: FORMAT, version, exportedAt: new Date().toISOString(), data: dumpAll() };
  }
  function restoreBackup(raw) {
    if (!raw || typeof raw !== "object" || raw.format !== FORMAT)
      return false;
    const data = raw.data;
    if (!data || typeof data !== "object")
      return false;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "string" || key === SETTINGS_KEY)
        continue;
      try {
        localStorage.setItem(PREFIX + key, value);
      } catch {}
    }
    const settingsRaw = data[SETTINGS_KEY];
    try {
      replaceBag(typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : {});
    } catch {
      replaceBag({});
    }
    return true;
  }
  function importBackup() {
    const file = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
    file.addEventListener("change", async () => {
      const chosen = file.files?.[0];
      file.remove();
      if (!chosen)
        return;
      try {
        if (!restoreBackup(JSON.parse(await chosen.text())))
          throw new Error("format");
        toast(t(L7.imported), { kind: "ok" });
      } catch {
        toast(t(L7.bad), { kind: "error" });
      }
    });
    document.body.appendChild(file);
    file.click();
  }
  var settings2 = definePluginSettings({
    exportData: {
      type: "action",
      label: { zh: "导出备份", en: "Export backup" },
      description: L7.backupHint,
      button: L7.export,
      run: () => download(`ccpp-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), "application/json")
    },
    importData: { type: "action", label: { zh: "导入备份", en: "Import backup" }, description: { zh: "从导出的 JSON 恢复。", en: "Restore from an exported JSON file." }, button: L7.import, run: importBackup },
    eraseData: {
      type: "action",
      label: L7.reset,
      description: { zh: "清空后页面会刷新。", en: "The page reloads afterwards." },
      button: { zh: "清空", en: "Erase" },
      confirm: L7.resetConfirm,
      run: () => {
        for (const key of Object.keys(dumpAll()))
          removeKey(key);
        location.reload();
      }
    }
  });
  var backup_default = definePlugin({
    name: "Backup",
    title: L7.title,
    description: {
      zh: "导出 / 导入 / 清空 CC++ 的全部设置与数据。CC++ 只调用 claude.ai 同源接口，不读取或外传 Cookie / token；只有在线主题会去下载你填写的 CSS 地址。",
      en: "Export, import or erase all CC++ settings and data. CC++ only calls claude.ai's own API and never reads or sends cookies or tokens; only online themes download the CSS URLs you add."
    },
    category: "core",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["NoticesApi"],
    settings: settings2,
    start() {}
  });

  // src/plugins/_core/quickCss/index.ts
  var css = persisted("quick-css", "", (v) => typeof v === "string");
  var settings3 = definePluginSettings({
    apply: { type: "boolean", label: { zh: "启用自定义 CSS", en: "Enable Quick CSS" }, description: { zh: "关掉后保留内容，但不再作用于页面。", en: "Off keeps your CSS but stops applying it." }, default: true }
  });
  var refresh = () => {};
  var L8 = {
    title: { zh: "自定义 CSS", en: "Quick CSS" },
    editor: { zh: "编辑器", en: "Editor" },
    hint: { zh: "实时应用到 claude.ai（停止输入 0.4 秒后生效）。Tab 键缩进。", en: "Applies to claude.ai live, 0.4 s after you stop typing. Tab indents." },
    placeholder: { zh: `/* 例如：让侧栏头像淡一点 */
[data-testid="user-menu-button"] { opacity: .6; }`, en: `/* e.g. dim the account button */
[data-testid="user-menu-button"] { opacity: .6; }` }
  };
  var quickCss_default = definePlugin({
    name: "QuickCss",
    title: L8.title,
    description: { zh: "在设置里写自己的 CSS，实时作用于页面。", en: "Write your own CSS in settings and see it applied live." },
    category: "appearance",
    icon: "braces",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings"],
    settings: settings3,
    start(scope) {
      const setCss = addStyle(scope, settings3.store.apply ? css.get() : "", "quick-css");
      refresh = () => setCss(settings3.store.apply ? css.get() : "");
      scope.defer(() => refresh = () => {});
      scope.defer(css.subscribe((value) => setCss(settings3.store.apply ? value : "")));
      registerTab(scope, {
        id: "quick-css",
        title: L8.title,
        icon: "braces",
        order: 20,
        render(container) {
          const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(settings3.store.apply), "aria-label": t(settings3.def.apply.label) });
          sw.addEventListener("click", () => {
            settings3.store.apply = !settings3.store.apply;
            sw.setAttribute("aria-checked", String(settings3.store.apply));
            setCss(settings3.store.apply ? css.get() : "");
          });
          const area = h("textarea", { class: "input editor", rows: 22, spellcheck: false, placeholder: t(L8.placeholder), "aria-label": t(L8.editor) });
          area.value = css.get();
          let timer;
          area.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(() => css.set(area.value), 400);
          });
          area.addEventListener("keydown", (event) => {
            if (event.key !== "Tab")
              return;
            event.preventDefault();
            area.setRangeText("  ", area.selectionStart, area.selectionEnd, "end");
          });
          container.append(h("div", { class: "rows" }, h("div", { class: "row" }, h("div", { class: "row-text" }, h("div", { class: "row-title", text: t(settings3.def.apply.label) }), h("div", { class: "row-desc", text: t(settings3.def.apply.description) })), h("div", { class: "row-control" }, sw))), h("div", { class: "section-head", style: { marginTop: "12px" } }, h("h3", { text: t(L8.editor) })), h("p", { class: "hint", text: t(L8.hint) }), area);
        }
      });
    },
    onSettingsChange() {
      refresh();
    }
  });

  // src/plugins/_core/themes/index.ts
  var logger7 = new Logger("Themes");
  var isStore = (v) => !!v && Array.isArray(v.online) && Array.isArray(v.local);
  var store = persisted("themes", { online: [], local: [] }, isStore);
  function parseMeta(css) {
    const block = /\/\*([\s\S]*?)\*\//.exec(css)?.[1] ?? "";
    const meta = {};
    for (const match of block.matchAll(/@(name|author|description)\s+([^\n*]+)/g))
      meta[match[1]] = match[2].trim();
    return meta;
  }
  function validThemeUrl(raw) {
    try {
      const url = new URL(raw.trim());
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }
  function combinedCss(themes) {
    return [...themes.online.filter((x) => x.enabled && x.css).map((x) => `/* ${x.url} */
${x.css}`), ...themes.local.filter((x) => x.enabled).map((x) => `/* ${x.name} */
${x.css}`)].join(`

`);
  }
  function fetchText(url) {
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise((resolve, reject) => GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: 15000,
        onload: (r) => r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error(`HTTP ${r.status}`)),
        onerror: () => reject(new Error("network")),
        ontimeout: () => reject(new Error("timeout"))
      }));
    }
    return fetch(url, { credentials: "omit" }).then((r) => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`)));
  }
  var REFRESH_MS = 60 * 60 * 1000;
  async function refreshOnline(url, force = false) {
    const theme = store.get().online.find((x) => x.url === url);
    if (!theme || !force && theme.css && Date.now() - (theme.fetchedAt ?? 0) < REFRESH_MS)
      return;
    let patch;
    try {
      patch = { css: await fetchText(url), fetchedAt: Date.now(), error: undefined };
    } catch (error) {
      logger7.warn("Theme download failed:", url, error);
      patch = { error: error instanceof Error ? error.message : String(error) };
    }
    const current = store.get();
    store.set({ ...current, online: current.online.map((x) => x.url === url ? { ...x, ...patch } : x) });
  }
  var L9 = {
    title: { zh: "主题", en: "Themes" },
    search: { zh: "搜索主题…", en: "Search themes…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    online: { zh: "在线主题", en: "Online themes" },
    local: { zh: "本地主题", en: "Local themes" },
    onlineShort: { zh: "在线", en: "Online" },
    localShort: { zh: "本地", en: "Local" },
    add: { zh: "添加", en: "Add" },
    create: { zh: "新建", en: "New" },
    addOnline: { zh: "添加在线主题", en: "Add online theme" },
    urlLabel: { zh: "CSS 地址（https）", en: "CSS URL (https)" },
    urlHint: { zh: "CC++ 会下载这个 CSS 并应用到 claude.ai，每小时更新一次。", en: "CC++ downloads this CSS, applies it to claude.ai and refreshes it hourly." },
    badUrl: { zh: "请填写 https 开头的地址", en: "Enter an https URL" },
    dupUrl: { zh: "这个主题已经添加过了", en: "That theme is already added" },
    editLocal: { zh: "编辑本地主题", en: "Edit local theme" },
    newLocal: { zh: "新建本地主题", en: "New local theme" },
    name: { zh: "名称", en: "Name" },
    author: { zh: "作者", en: "Author" },
    css: { zh: "CSS", en: "CSS" },
    save: { zh: "保存", en: "Save" },
    cancel: { zh: "取消", en: "Cancel" },
    edit: { zh: "编辑", en: "Edit" },
    copyUrl: { zh: "复制地址", en: "Copy URL" },
    copied: { zh: "已复制", en: "Copied" },
    refresh: { zh: "重新下载", en: "Download again" },
    remove: { zh: "删除", en: "Delete" },
    removeTitle: { zh: "删除主题？", en: "Delete theme?" },
    removeBody: { zh: "「{name}」会被删除。", en: "“{name}” will be deleted." },
    emptyOnline: { zh: "还没有在线主题。点「添加」填一个 CSS 地址。", en: "No online themes yet. Use Add to enter a CSS URL." },
    emptyLocal: { zh: "还没有本地主题。点「新建」自己写一个。", en: "No local themes yet. Use New to write one." },
    noMatch: { zh: "没有匹配的主题", en: "No matching themes" },
    failed: { zh: "下载失败", en: "Download failed" },
    lines: { zh: "{n} 行 CSS", en: "{n} lines of CSS" },
    untitled: { zh: "未命名主题", en: "Untitled theme" }
  };
  var ui = { query: "", filter: "all" };
  var nameOfOnline = (theme) => parseMeta(theme.css ?? "").name || new URL(theme.url).pathname.split("/").pop() || theme.url;
  function setOnline(url, patch) {
    const current = store.get();
    store.set({ ...current, online: current.online.map((x) => x.url === url ? { ...x, ...patch } : x) });
  }
  function setLocal(id, patch) {
    const current = store.get();
    store.set({ ...current, local: patch ? current.local.map((x) => x.id === id ? { ...x, ...patch } : x) : current.local.filter((x) => x.id !== id) });
  }
  function themeCard(o) {
    const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(o.enabled), "aria-label": o.name });
    sw.addEventListener("click", () => o.toggle(!o.enabled));
    return h("div", { class: `card${o.enabled ? " on" : " off"}${o.error ? " crashed" : ""}` }, h("div", { class: "card-body" }, h("div", { class: "card-top" }, h("span", { class: "chip-icon" }, icon("palette", 14)), h("span", { class: "card-title", text: o.name, ...tipAttrs(o.name), style: { cursor: "default" } }), h("div", { class: "card-actions" }, ...o.actions, sw)), h("div", { class: "card-desc", text: o.desc }), h("div", { class: "card-gap" }), h("div", { class: "card-foot" }, icon(o.online ? "globe" : "folder", 12), h("span", { text: t(o.online ? L9.onlineShort : L9.localShort) }), o.error ? h("span", { class: "badge bad", text: t(L9.failed), ...tipAttrs(t(L9.failed), o.error) }) : null, h("span", { class: "author", text: o.author }))));
  }
  var iconAction = (name, label, run) => {
    const button = h("button", { type: "button", class: "icon-btn", ...tipAttrs(t(label)), "aria-label": t(label) }, icon(name, 14));
    button.addEventListener("click", run);
    return button;
  };
  async function askRemove(name) {
    return confirmDialog({ title: t(L9.removeTitle), body: t(L9.removeBody).replace("{name}", name), ok: L9.remove, danger: true });
  }
  function openAddOnline() {
    const input = h("input", { class: "input", type: "url", placeholder: "https://…/theme.css", autofocus: true, "aria-label": t(L9.urlLabel) });
    const error = h("div", { class: "row-desc", style: { color: "var(--bad)" } });
    const add = h("button", { type: "button", class: "btn primary", text: t(L9.add) });
    const cancel = h("button", { type: "button", class: "btn", text: t(L9.cancel) });
    const submit = () => {
      const url = validThemeUrl(input.value);
      if (!url)
        return void (error.textContent = t(L9.badUrl));
      if (store.get().online.some((x) => x.url === url))
        return void (error.textContent = t(L9.dupUrl));
      const current = store.get();
      store.set({ ...current, online: [...current.online, { url, enabled: true }] });
      refreshOnline(url, true);
      close();
    };
    add.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => event.key === "Enter" && submit());
    let close = () => {};
    cancel.addEventListener("click", () => close());
    close = openModal(dialogFrame({ title: t(L9.addOnline), icon: "globe", size: "small", body: [h("div", { class: "field" }, h("label", { text: t(L9.urlLabel) }), input, error), h("p", { class: "hint", text: t(L9.urlHint) })], foot: [cancel, add], onClose: () => close() }));
  }
  function openLocalEditor(theme) {
    const name = h("input", { class: "input", value: theme?.name ?? "", placeholder: t(L9.untitled), autofocus: true });
    const author = h("input", { class: "input", value: theme?.author ?? "" });
    const css = h("textarea", { class: "input editor", rows: 16, spellcheck: false, placeholder: `/* @name My theme */
:root { }` });
    css.value = theme?.css ?? "";
    css.addEventListener("keydown", (event) => {
      if (event.key !== "Tab")
        return;
      event.preventDefault();
      css.setRangeText("  ", css.selectionStart, css.selectionEnd, "end");
    });
    const save = h("button", { type: "button", class: "btn primary", text: t(L9.save) });
    const cancel = h("button", { type: "button", class: "btn", text: t(L9.cancel) });
    save.addEventListener("click", () => {
      const meta = parseMeta(css.value);
      const next = { name: name.value.trim() || meta.name || t(L9.untitled), author: author.value.trim() || meta.author || "", css: css.value };
      if (theme)
        setLocal(theme.id, next);
      else {
        const current = store.get();
        store.set({ ...current, local: [...current.local, { id: `t${Date.now().toString(36)}`, enabled: true, ...next }] });
      }
      close();
    });
    let close = () => {};
    cancel.addEventListener("click", () => close());
    close = openModal(dialogFrame({
      title: t(theme ? L9.editLocal : L9.newLocal),
      icon: "palette",
      size: "wide",
      body: [h("div", { class: "field" }, h("label", { text: t(L9.name) }), name), h("div", { class: "field" }, h("label", { text: t(L9.author) }), author), h("div", { class: "field" }, h("label", { text: t(L9.css) }), css)],
      foot: [cancel, save],
      onClose: () => close()
    }));
  }
  function renderThemes(container) {
    const search = h("input", { class: "input", type: "search", placeholder: t(L9.search), value: ui.query, "aria-label": t(L9.search) });
    const filter = h("select", { class: "input", "aria-label": t(L9.all) }, ...["all", "enabled", "disabled", "online", "local"].map((value) => h("option", { value, text: t(value === "online" ? L9.onlineShort : value === "local" ? L9.localShort : L9[value]), selected: ui.filter === value })));
    container.appendChild(h("div", { class: "sticky-top" }, h("div", { class: "bar" }, h("label", { class: "search" }, icon("search", 14), search), filter)));
    const body = h("div");
    container.appendChild(body);
    const matches = (name, extra, enabled) => (!ui.query || `${name} ${extra}`.toLowerCase().includes(ui.query.toLowerCase())) && (ui.filter === "enabled" ? enabled : ui.filter === "disabled" ? !enabled : true);
    const draw = () => {
      clear(body);
      const themes = store.get();
      const section = (title, buttonText, buttonIcon, onAdd, cards, empty) => {
        const add = h("button", { type: "button", class: "btn" }, icon(buttonIcon, 14), t(buttonText));
        add.addEventListener("click", onAdd);
        const filtered = ui.query || ui.filter !== "all";
        body.appendChild(h("div", { class: "section" }, h("div", { class: "section-head" }, h("h3", { text: t(title) }), add), cards.length ? h("div", { class: "grid" }, ...cards) : h("div", { class: "empty", text: t(filtered ? L9.noMatch : empty) })));
      };
      if (ui.filter !== "local") {
        const cards = themes.online.filter((x) => matches(nameOfOnline(x), x.url, x.enabled)).map((theme) => {
          const meta = parseMeta(theme.css ?? "");
          return themeCard({
            name: nameOfOnline(theme),
            desc: meta.description || theme.url,
            author: meta.author || new URL(theme.url).host,
            online: true,
            enabled: theme.enabled,
            error: theme.error,
            toggle: (on) => {
              setOnline(theme.url, { enabled: on });
              if (on)
                refreshOnline(theme.url);
            },
            actions: [
              iconAction("copy", L9.copyUrl, () => navigator.clipboard?.writeText(theme.url).then(() => toast(t(L9.copied), { kind: "ok" }))),
              iconAction("refresh", L9.refresh, () => void refreshOnline(theme.url, true)),
              iconAction("trash", L9.remove, async () => {
                if (!await askRemove(nameOfOnline(theme)))
                  return;
                const current = store.get();
                store.set({ ...current, online: current.online.filter((x) => x.url !== theme.url) });
              })
            ]
          });
        });
        section(L9.online, L9.add, "plus", openAddOnline, cards, L9.emptyOnline);
      }
      if (ui.filter !== "online") {
        const cards = themes.local.filter((x) => matches(x.name, x.author, x.enabled)).map((theme) => themeCard({
          name: theme.name,
          desc: parseMeta(theme.css).description || t(L9.lines).replace("{n}", String(theme.css.split(`
`).length)),
          author: theme.author || "—",
          online: false,
          enabled: theme.enabled,
          toggle: (on) => setLocal(theme.id, { enabled: on }),
          actions: [
            iconAction("pencil", L9.edit, () => openLocalEditor(theme)),
            iconAction("trash", L9.remove, async () => await askRemove(theme.name) && setLocal(theme.id, null))
          ]
        }));
        section(L9.local, L9.create, "plus", () => openLocalEditor(), cards, L9.emptyLocal);
      }
    };
    search.addEventListener("input", () => {
      ui.query = search.value;
      draw();
    });
    filter.addEventListener("change", () => {
      ui.filter = filter.value;
      draw();
    });
    draw();
  }
  var themes_default = definePlugin({
    name: "Themes",
    title: L9.title,
    description: { zh: "在线主题（填 CSS 地址）和本地主题（自己写 CSS），可分别启用、编辑、删除。", en: "Online themes (from a CSS URL) and local themes (your own CSS), each switchable, editable and removable." },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings", "NoticesApi"],
    start(scope) {
      const setCss = addStyle(scope, combinedCss(store.get()), "themes");
      let redrawTab = () => {};
      scope.defer(store.subscribe((value) => {
        setCss(combinedCss(value));
        redrawTab();
      }));
      for (const theme of store.get().online)
        if (theme.enabled)
          refreshOnline(theme.url);
      registerTab(scope, {
        id: "themes",
        title: L9.title,
        icon: "palette",
        order: 10,
        render(container) {
          renderThemes(container);
          redrawTab = () => {
            if (!container.isConnected)
              return;
            const top = container.scrollTop;
            clear(container);
            renderThemes(container);
            container.scrollTop = top;
          };
        }
      });
    }
  });

  // src/lib/format.ts
  var zh = () => getLang() === "zh";
  function untilText(target, now = Date.now()) {
    const minutes = Math.max(0, Math.round((target - now) / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor(minutes % 1440 / 60);
    const mins = minutes % 60;
    if (zh()) {
      if (days)
        return `${days} 天 ${hours} 小时`;
      if (hours)
        return `${hours} 小时 ${mins} 分钟`;
      return `${mins} 分钟`;
    }
    if (days)
      return `${days}d ${hours}h`;
    if (hours)
      return `${hours}h ${mins}m`;
    return `${mins}m`;
  }
  function agoText(at, now = Date.now()) {
    const s = Math.max(0, Math.round((now - at) / 1000));
    if (s < 10)
      return zh() ? "刚刚" : "just now";
    if (s < 60)
      return zh() ? `${s} 秒前` : `${s}s ago`;
    const m = Math.round(s / 60);
    if (m < 60)
      return zh() ? `${m} 分钟前` : `${m}m ago`;
    const hr = Math.round(m / 60);
    if (hr < 48)
      return zh() ? `${hr} 小时前` : `${hr}h ago`;
    const d = Math.round(hr / 24);
    return zh() ? `${d} 天前` : `${d}d ago`;
  }
  var pad = (n) => String(n).padStart(2, "0");
  function dateTimeText(at, now = Date.now()) {
    const d = new Date(at);
    const today = new Date(now);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (d.toDateString() === today.toDateString())
      return time;
    const date = d.getFullYear() === today.getFullYear() ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    return `${date} ${time}`;
  }
  var fullDateText = (at) => new Date(at).toLocaleString(zh() ? "zh-CN" : "en-US");
  var snippet = (text, max = 80) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
  };

  // src/lib/popover.ts
  var POPOVER_CSS = `
.panel { position: fixed; width: var(--w, 300px); max-height: min(70vh, 560px); overflow: auto; padding: 12px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; animation: pop .12s ease-out; }
@keyframes pop { from { opacity: 0; transform: translateY(4px); } }
.top { display: flex; align-items: center; gap: 6px; } .top b { flex: 1; font-size: 14px; }
/* A popover's header (and anything marked .sticky after it) stays put while its list scrolls. */
.panel > .top { position: sticky; top: -12px; z-index: 2; margin: -12px -12px 0; padding: 12px 12px 4px; background: var(--bg); }
.msg { color: var(--fg2); } .msg.bad { color: var(--bad); }
.item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 7px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; }
.item:hover, .item.active { background: var(--bg2); }
.item .grow { flex: 1; min-width: 0; } .item .sub { color: var(--fg3); font-size: 12px; }
.clip { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clip2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;
  function successor(old) {
    const label = old.getAttribute("aria-label");
    const sel = old.tagName.toLowerCase() + [...old.classList].map((c) => `.${CSS.escape(c)}`).join("");
    return [...document.querySelectorAll(sel)].find((el) => el.getAttribute("aria-label") === label) ?? null;
  }
  function createPopover(scope, id, css = "", width = 300) {
    let sub = null;
    let panel = null;
    let anchor = null;
    let renderFn = null;
    const close = () => {
      sub?.dispose();
      sub = null;
      panel = null;
      anchor = null;
    };
    const draw = () => {
      if (!panel || !anchor || !renderFn)
        return;
      if (!anchor.isConnected) {
        const next = successor(anchor);
        if (!next) {
          const old = anchor;
          requestAnimationFrame(() => {
            if (anchor !== old)
              return;
            const late = successor(old);
            if (late) {
              anchor = late;
              draw();
            } else
              close();
          });
          return;
        }
        anchor = next;
      }
      clear(panel);
      renderFn(panel, close);
      anchorPosition(anchor, panel);
    };
    const open = (from, render) => {
      if (panel && anchor === from)
        return close();
      close();
      sub = scope.child();
      const host = createHost(sub, id, POPOVER_CSS + css);
      panel = h("div", { class: "panel", role: "dialog", style: { "--w": `${width}px` } });
      panel.style.setProperty("--w", `${width}px`);
      host.box.appendChild(panel);
      anchor = from;
      renderFn = render;
      draw();
      sub.listen(document, "pointerdown", (event) => {
        const path = event.composedPath();
        if (!path.includes(host.host) && !(anchor && path.includes(anchor)))
          close();
      }, { capture: true });
      sub.listen(window, "keydown", (event) => event.key === "Escape" && close());
      sub.listen(window, "resize", close);
    };
    scope.defer(close);
    return { open, close, update: draw, isOpen: () => !!panel };
  }

  // src/plugins/usageDisplay/stats.ts
  var RETAIN_MIN = 7;
  var RETAIN_MAX = 180;
  var CHART_DAYS = 7;
  var RESET_TOLERANCE_MS = 60000;
  var DROP = 1;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var pad2 = (n) => String(n).padStart(2, "0");
  function localDateKey(at) {
    const d = new Date(at);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  function shiftDateKey(date, days) {
    const [y, m, d] = date.split("-").map(Number);
    return localDateKey(new Date(y, m - 1, d + days).getTime());
  }
  var emptyTrack = () => ({ start: null, last: null, resetAt: null, accrued: 0 });
  var emptyDay = (date, now) => ({ date, week: emptyTrack(), session: emptyTrack(), updatedAt: now });
  function applySnapshot(track, percent, resetAt, now) {
    const next = { ...track };
    if (percent == null) {
      if (resetAt != null)
        next.resetAt = resetAt;
      return next;
    }
    const moved = resetAt != null && next.resetAt != null && Math.abs(resetAt - next.resetAt) >= RESET_TOLERANCE_MS;
    const expired = next.resetAt != null && now >= next.resetAt;
    const dropped = next.last != null && percent < next.last - DROP;
    if (moved || expired || dropped) {
      next.accrued = trackDelta(next);
      next.start = percent;
      next.last = percent;
      next.resetAt = resetAt;
      return next;
    }
    next.start ??= percent;
    next.last = percent;
    if (resetAt != null)
      next.resetAt = resetAt;
    return next;
  }
  function trackDelta(track) {
    return track.accrued + (track.start != null && track.last != null ? Math.max(0, track.last - track.start) : 0);
  }
  var recorded = (day) => !!day && (day.week.last != null || day.week.accrued > 0 || day.session.last != null || day.session.accrued > 0);
  function carryOver(prev, percent, resetAt, now) {
    if (!prev || prev.last == null || percent == null || percent < prev.last)
      return emptyTrack();
    if (prev.resetAt != null && (now >= prev.resetAt || resetAt != null && Math.abs(resetAt - prev.resetAt) >= RESET_TOLERANCE_MS))
      return emptyTrack();
    return { start: prev.last, last: prev.last, resetAt: prev.resetAt, accrued: 0 };
  }
  function pruneDays(days, retainDays, now) {
    const cutoff = shiftDateKey(localDateKey(now), 1 - Math.min(RETAIN_MAX, Math.max(RETAIN_MIN, Math.floor(retainDays))));
    return Object.fromEntries(Object.entries(days).filter(([date]) => date >= cutoff));
  }
  function addSnapshot(days, snap, retainDays, now) {
    const date = localDateKey(now);
    let day = days[date];
    if (!day) {
      const prev = days[shiftDateKey(date, -1)];
      day = {
        ...emptyDay(date, now),
        week: carryOver(prev?.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now),
        session: carryOver(prev?.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now)
      };
    }
    const next = {
      date,
      week: applySnapshot(day.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now),
      session: applySnapshot(day.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now),
      updatedAt: now
    };
    return pruneDays({ ...days, [date]: next }, retainDays, now);
  }
  function chartDays(days, now) {
    const today = localDateKey(now);
    let start = shiftDateKey(today, 1 - CHART_DAYS);
    for (const date of Object.keys(days))
      if (date < start)
        start = date;
    const out = [];
    for (let date = start;date <= today; date = shiftDateKey(date, 1))
      out.push(days[date] ?? emptyDay(date, now));
    return out;
  }
  function chartScale(days) {
    const max = Math.max(0, ...days.map((day) => trackDelta(day.week)));
    return Math.max(20, Math.ceil(max / 10) * 10);
  }
  var keyFor = (org) => `usageStats:${org}`;
  function isDay(value) {
    const day = value;
    const track = (t) => !!t && typeof t === "object" && typeof t.accrued === "number";
    return !!day && typeof day === "object" && DATE_RE.test(day.date) && track(day.week) && track(day.session);
  }
  function loadDays(org) {
    const file = readJson(keyFor(org), null);
    if (!file || file.version !== 1 || !file.days || typeof file.days !== "object")
      return {};
    return Object.fromEntries(Object.entries(file.days).filter(([date, day]) => isDay(day) && day.date === date));
  }
  function recordSnapshot(org, snap, retainDays, now = Date.now()) {
    const days = addSnapshot(loadDays(org), snap, retainDays, now);
    writeJson(keyFor(org), { version: 1, days });
    return days;
  }
  var clearDays = (org) => removeKey(keyFor(org));

  // src/plugins/usageDisplay/index.ts
  var logger8 = new Logger("UsageDisplay");
  var settings4 = definePluginSettings({
    style: {
      type: "select",
      label: { zh: "输入框里的样式", en: "Style in the chat input" },
      default: "rings",
      options: [
        { value: "rings", label: { zh: "双圆环", en: "Two rings" } },
        { value: "text", label: { zh: "百分比文字", en: "Percent text" } },
        { value: "both", label: { zh: "圆环 + 文字", en: "Rings + text" } }
      ]
    },
    refreshSec: { type: "number", label: { zh: "自动刷新间隔", en: "Refresh every" }, default: 60, min: 30, max: 600, step: 10, unit: "s" },
    warnAt: { type: "number", label: { zh: "黄色提醒阈值", en: "Amber from" }, default: 75, min: 10, max: 99, unit: "%" },
    dangerAt: { type: "number", label: { zh: "红色提醒阈值", en: "Red from" }, default: 90, min: 10, max: 100, unit: "%" },
    stats: {
      type: "boolean",
      label: { zh: "按日记录用量", en: "Record daily usage" },
      description: {
        zh: "在本机记下每天用掉的每周额度和 5 小时额度。悬停圆环看今天，点开看按日柱状图。只在打开 claude.ai 时记录。",
        en: "Keeps a per-day log of weekly and 5-hour usage on this device. Hover a ring for today; click for a daily chart. Recorded only while claude.ai is open."
      },
      default: true
    },
    retainDays: { type: "number", label: { zh: "保留多少天", en: "Days to keep" }, default: 90, min: RETAIN_MIN, max: RETAIN_MAX, visible: (v) => !!v.stats },
    clearStats: {
      type: "action",
      label: { zh: "清空用量记录", en: "Clear usage history" },
      button: { zh: "清空", en: "Clear" },
      confirm: { zh: "删除本机记录的当前账号全部按日用量？此操作无法撤销。", en: "Delete every day of usage recorded on this device for this account? This can't be undone." },
      visible: (v) => !!v.stats,
      run() {
        getOrgId().then((org) => {
          clearDays(org);
          days = {};
          changed();
        });
      }
    }
  });
  var L10 = {
    title: { zh: "用量", en: "Usage" },
    session: { zh: "5 小时会话", en: "5-hour session" },
    weekly: { zh: "每周", en: "Weekly" },
    resetsIn: { zh: "{t}后重置", en: "Resets in {t}" },
    resetsAt: { zh: "重置于 {t}", en: "Resets {t}" },
    updated: { zh: "更新于 {t} · claude.ai 同源接口", en: "Updated {t} · claude.ai API" },
    refresh: { zh: "刷新", en: "Refresh" },
    open: { zh: "打开官方用量页", en: "Open usage page" },
    loading: { zh: "读取中…", en: "Loading…" },
    timeout: { zh: "读取用量超时，稍后自动重试", en: "Usage request timed out; retrying shortly" },
    error: { zh: "读取用量失败：{e}", en: "Could not read usage: {e}" },
    signedOut: { zh: "未登录或无权读取用量", en: "Not signed in or no access to usage" },
    none: { zh: "当前套餐没有用量窗口", en: "No usage windows on this plan" },
    today: { zh: "今天 {p}", en: "Today {p}" },
    daily: { zh: "按日用量", en: "Usage by day" },
    dailyNote: { zh: "本机打开 claude.ai 时记录；没打开时的用量算在下次看到的那天。", en: "Recorded while claude.ai is open here; usage while it's closed counts on the day it's next seen." },
    noDays: { zh: "还没有记录，从现在开始统计。", en: "Nothing recorded yet; counting starts now." },
    noRecord: { zh: "没有记录", en: "Not recorded" },
    todayShort: { zh: "今", en: "Today" },
    todayLong: { zh: "今天", en: "Today" },
    dayWeekly: { zh: "每周额度 {p}", en: "Weekly {p}" },
    daySession: { zh: "5 小时额度 {p}", en: "5-hour {p}" }
  };
  var usage = null;
  var error = null;
  var loading = false;
  var lastAttempt = 0;
  var inflight = null;
  var retryTimer;
  var listeners2 = new Set;
  var changed = () => listeners2.forEach((fn) => fn());
  var org = null;
  var days = {};
  var picked = null;
  async function snapshot(current) {
    if (!settings4.store.stats)
      return;
    try {
      org = await getOrgId();
    } catch {
      return;
    }
    const win = (w) => w ? { percent: w.utilization, resetAt: w.resetsAt } : null;
    days = recordSnapshot(org, { week: win(current.sevenDay), session: win(current.fiveHour) }, settings4.store.retainDays, current.fetchedAt);
  }
  var deltaText = (value) => `+${Math.round(value * 10) / 10}%`;
  function todayDetail(kind) {
    if (!settings4.store.stats || !org)
      return "";
    const day = days[localDateKey(Date.now())];
    return recorded(day) ? t(L10.today).replace("{p}", deltaText(trackDelta(day[kind]))) : "";
  }
  var MIN_GAP_MS = 5000;
  async function refresh2(force = false) {
    if (loading || !force && Date.now() - lastAttempt < MIN_GAP_MS)
      return;
    if (!force && document.hidden)
      return;
    loading = true;
    lastAttempt = Date.now();
    const controller = inflight = new AbortController;
    let timedOut = false;
    const timeout = setTimeout(() => (timedOut = true, controller.abort()), 12000);
    clearTimeout(retryTimer);
    changed();
    try {
      usage = await getUsage(controller.signal);
      error = null;
      await snapshot(usage);
    } catch (err) {
      if (timedOut) {
        if (!usage)
          error = t(L10.timeout);
        retryTimer = setTimeout(() => refresh2(true), 8000);
        return;
      }
      if (err.name === "AbortError")
        return;
      error = err instanceof ApiError && (err.status === 401 || err.status === 403) ? t(L10.signedOut) : err.message || String(err);
      logger8.warn("Usage refresh failed:", err);
    } finally {
      clearTimeout(timeout);
      inflight = null;
      loading = false;
      changed();
    }
  }
  function level(percent, warnAt, dangerAt) {
    if (percent >= dangerAt)
      return "bad";
    if (percent >= warnAt)
      return "warn";
    return "ok";
  }
  var resetText = (window2) => !window2.resetsAt ? "" : window2.resetsAt - Date.now() < 24 * 3600 * 1000 ? t(L10.resetsIn).replace("{t}", untilText(window2.resetsAt)) : t(L10.resetsAt).replace("{t}", dateTimeText(window2.resetsAt));
  var COLORS = { ok: "var(--cds-fill-accent, #2a78d6)", warn: "var(--cds-fill-warning, #fab219)", bad: "var(--cds-fill-danger, #d03b3b)" };
  var SVG_NS = "http://www.w3.org/2000/svg";
  var nativeTrack = () => document.querySelector("svg [data-ring-track]")?.getAttribute("stroke") || "var(--cds-alpha-2, rgba(127,127,127,.12))";
  function ringSvg(percent) {
    const svg = document.createElementNS(SVG_NS, "svg");
    for (const [k, v] of Object.entries({ width: "14", height: "14", viewBox: "0 0 14 14", "aria-hidden": "true" }))
      svg.setAttribute(k, v);
    svg.style.transform = "rotate(-90deg)";
    const circle = (attrs) => {
      const c = document.createElementNS(SVG_NS, "circle");
      for (const [k, v] of Object.entries({ cx: "7", cy: "7", r: "6", fill: "none", "stroke-width": "2", ...attrs }))
        c.setAttribute(k, v);
      return svg.appendChild(c);
    };
    circle({ stroke: nativeTrack() });
    if (percent !== null) {
      const length = 2 * Math.PI * 6;
      const clamped = Math.max(0, Math.min(100, percent));
      circle({
        stroke: COLORS[level(percent, settings4.store.warnAt, settings4.store.dangerAt)],
        "stroke-dasharray": String(length),
        "stroke-dashoffset": String(length * (1 - clamped / 100)),
        "stroke-linecap": "round"
      });
    }
    return svg;
  }
  function usageButton(open, label, tip, ...children) {
    const button = h("button", { type: "button", class: "ccpp-usage-btn", "aria-label": label, ...tip }, ...children);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideTip();
      open(button);
    });
    return button;
  }
  function ring(open, window2, label, kind) {
    const percent = window2 ? Math.round(window2.utilization) : null;
    return usageButton(open, percent === null ? label : `${label} ${percent}%`, window2 ? tipAttrs(`${label}: ${percent}%`, [resetText(window2), todayDetail(kind)].filter(Boolean).join(" · ")) : tipAttrs(label, error ?? t(L10.loading)), ringSvg(window2 ? window2.utilization : null));
  }
  function chip(open) {
    const style = settings4.store.style;
    const five = usage?.fiveHour ?? null;
    const week = usage?.sevenDay ?? null;
    const pct = (w) => w ? `${Math.round(w.utilization)}%` : "–";
    const text = !usage ? error ? "!" : "…" : `${pct(five)} · ${pct(week)}`;
    const tip = usage ? `${t(L10.session)} ${pct(five)} · ${t(L10.weekly)} ${pct(week)}` : error ?? t(L10.loading);
    return h("span", { class: `ccpp-usage${error && !usage ? " err" : ""}` }, ...style !== "text" ? [ring(open, five, t(L10.session), "session"), ring(open, week, t(L10.weekly), "week")] : [], ...style !== "rings" ? [usageButton(open, tip, tipAttrs(tip, five ? resetText(five) : ""), h("span", { text }))] : []);
  }
  var SLOT_CSS = `
.ccpp-usage { display: inline-flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
.ccpp-usage-btn { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; height: var(--cds-h-control, 32px); min-width: var(--cds-h-control, 32px); padding: 0; border: 0; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: calc(0.8125rem * var(--cds-rem-scale, 1)); cursor: pointer; transition: background-color .15s ease-out; }
.ccpp-usage-btn:has(> span) { padding: 0 6px; }
.ccpp-usage-btn:hover, .ccpp-usage-btn[aria-expanded="true"] { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-usage-btn:focus-visible { outline: none; box-shadow: var(--cds-shadow-focus, 0 0 0 2px var(--cds-fill-accent, #2a78d6)); }
.ccpp-usage.err .ccpp-usage-btn { color: var(--cds-text-danger, #d03b3b); }
`;
  var PANEL_CSS2 = `
.metric { display: flex; flex-direction: column; gap: 4px; }
.metric .line { display: flex; justify-content: space-between; } .metric .pct { font-weight: 600; font-variant-numeric: tabular-nums; }
.bar { height: 6px; border-radius: 3px; background: var(--bg3); overflow: hidden; } .bar > i { display: block; height: 100%; border-radius: 3px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--fg3); }
.foot a { color: var(--accent); text-decoration: none; }
.daily { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid var(--line-soft); }
.daily .line { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.chart { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: thin; }
.day { flex: 0 0 34px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px 0; border: 0; border-radius: 6px; background: transparent; color: var(--fg3); font: inherit; font-size: 11px; font-variant-numeric: tabular-nums; cursor: pointer; }
.day:hover { background: var(--bg2); } .day.on { background: var(--bg3); color: var(--fg); }
.day:focus-visible { outline: none; box-shadow: var(--focus); }
.day .v { height: 14px; font-size: 10px; white-space: nowrap; }
.day .track { display: flex; align-items: flex-end; width: 10px; height: 64px; border-radius: 3px; background: var(--bg2); overflow: hidden; }
.day .track > i { display: block; width: 100%; border-radius: 3px; background: var(--accent); }
.day.empty .track { opacity: .5; }
.daily .detail { font-size: 12px; color: var(--fg2); } .daily .note { font-size: 11px; color: var(--fg3); }
`;
  function metric(label, window2) {
    const lv = level(window2.utilization, settings4.store.warnAt, settings4.store.dangerAt);
    const reset = window2.resetsAt ? window2.resetsAt - Date.now() < 24 * 3600 * 1000 ? t(L10.resetsIn).replace("{t}", untilText(window2.resetsAt)) : t(L10.resetsAt).replace("{t}", dateTimeText(window2.resetsAt)) : "";
    return h("div", { class: "metric" }, h("div", { class: "line" }, h("span", { text: label }), h("span", { class: "pct", text: `${Math.round(window2.utilization)}%`, style: { color: COLORS[lv] } })), h("div", { class: "bar" }, h("i", { style: { width: `${window2.utilization}%`, background: COLORS[lv] } })), reset ? h("div", { class: "muted", text: reset, style: { fontSize: "12px" } }) : null);
  }
  function dayLabel(date) {
    if (date === localDateKey(Date.now()))
      return t(L10.todayLong);
    const [y, m, d] = date.split("-").map(Number);
    const at = new Date(y, m - 1, d);
    return getLang() === "zh" ? `${m}月${d}日 ${at.toLocaleDateString("zh-CN", { weekday: "short" })}` : at.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  function dailySection(redraw) {
    const now = Date.now();
    const today = localDateKey(now);
    const bars = chartDays(days, now);
    const scale = chartScale(bars);
    const active = bars.find((day) => day.date === picked) ?? bars[bars.length - 1];
    const chart = h("div", { class: "chart", role: "listbox", "aria-label": t(L10.daily) });
    let activeBar = null;
    for (const day of bars) {
      const has = recorded(day);
      const delta = trackDelta(day.week);
      const bar = h("button", { type: "button", class: `day${has ? "" : " empty"}${day === active ? " on" : ""}`, role: "option", "aria-selected": String(day === active), "aria-label": `${dayLabel(day.date)} ${has ? deltaText(delta) : t(L10.noRecord)}` }, h("span", { class: "v", text: has ? deltaText(delta) : "" }), h("span", { class: "track" }, h("i", { style: { height: `${has ? Math.min(100, delta / scale * 100) : 0}%` } })), h("span", { text: day.date === today ? t(L10.todayShort) : String(Number(day.date.slice(8))) }));
      bar.addEventListener("click", () => {
        picked = day.date === today ? null : day.date;
        redraw();
      });
      if (day === active)
        activeBar = bar;
      chart.appendChild(bar);
    }
    chart.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
        return;
      event.preventDefault();
      const i = bars.indexOf(active) + (event.key === "ArrowRight" ? 1 : -1);
      const next = bars[Math.max(0, Math.min(bars.length - 1, i))];
      picked = next.date === today ? null : next.date;
      redraw();
      chart.getRootNode().querySelector(".day.on")?.focus();
    });
    requestAnimationFrame(() => {
      if (!activeBar)
        return;
      const right = activeBar.offsetLeft + activeBar.offsetWidth - chart.clientWidth;
      if (chart.scrollLeft < right)
        chart.scrollLeft = right;
      else if (chart.scrollLeft > activeBar.offsetLeft)
        chart.scrollLeft = activeBar.offsetLeft;
    });
    const detail = recorded(active) ? `${t(L10.dayWeekly).replace("{p}", deltaText(trackDelta(active.week)))} · ${t(L10.daySession).replace("{p}", deltaText(trackDelta(active.session)))}` : t(L10.noRecord);
    return h("div", { class: "daily" }, h("div", { class: "line" }, h("b", { text: t(L10.daily) }), h("span", { class: "detail", text: dayLabel(active.date) })), Object.keys(days).length ? chart : h("div", { class: "msg", text: t(L10.noDays) }), Object.keys(days).length ? h("div", { class: "detail", text: detail }) : null, h("div", { class: "note", text: t(L10.dailyNote) }));
  }
  function renderPanel(panel, redraw) {
    const refreshBtn = h("button", { type: "button", class: "icon-btn", ...tipAttrs(t(L10.refresh)), "aria-label": t(L10.refresh) }, icon("refresh", 15));
    if (loading)
      refreshBtn.firstElementChild?.classList.add("spin");
    refreshBtn.addEventListener("click", () => refresh2(true));
    panel.appendChild(h("div", { class: "top" }, icon("gauge", 16), h("b", { text: t(L10.title) }), refreshBtn));
    if (error)
      panel.appendChild(h("div", { class: "msg bad", text: t(L10.error).replace("{e}", error) }));
    if (!usage && !error)
      panel.appendChild(h("div", { class: "msg", text: t(L10.loading) }));
    if (usage) {
      const rows = [
        usage.fiveHour && metric(t(L10.session), usage.fiveHour),
        usage.sevenDay && metric(t(L10.weekly), usage.sevenDay),
        ...usage.extra.map((e) => metric(`${t(L10.weekly)} · ${e.key}`, e.window))
      ].filter(Boolean);
      if (!rows.length)
        panel.appendChild(h("div", { class: "msg", text: t(L10.none) }));
      panel.append(...rows);
      if (settings4.store.stats && org)
        panel.appendChild(dailySection(redraw));
    }
    panel.appendChild(h("div", { class: "foot" }, h("span", { text: usage ? t(L10.updated).replace("{t}", agoText(usage.fetchedAt)) : "" }), h("a", { href: "/settings/usage", text: t(L10.open) })));
  }
  var usageDisplay_default = definePlugin({
    name: "UsageDisplay",
    title: { zh: "用量显示", en: "Usage display" },
    description: {
      zh: "在输入框模型选择器旁同时显示 5 小时会话与每周用量（双圆环 / 百分比），点开看重置时间；普通对话、Claude Code 首页和项目页都有。数据来自 claude.ai 自己的用量接口。",
      en: "Shows the 5-hour session and weekly usage side by side next to the model picker (rings or percent), in chats, Claude Code and project pages; click for reset times. Data comes from claude.ai's own usage endpoint."
    },
    category: "composer",
    icon: "gauge",
    enabledByDefault: true,
    dependencies: ["ClaudeApi", "SlotsApi", "StylesApi", "ChatStateApi"],
    settings: settings4,
    start(scope) {
      addStyle(scope, SLOT_CSS, "usage");
      const panel = createPopover(scope, "usage-panel", PANEL_CSS2);
      const open = (anchor) => {
        if (org)
          days = loadDays(org);
        picked = null;
        panel.open(anchor, (p) => renderPanel(p, () => panel.update()));
        refresh2();
      };
      const item = addSlotItem(scope, "composer", "usage", () => chip(open), -10);
      const update = () => {
        refreshSlotItem(item);
        panel.update();
      };
      listeners2.add(update);
      scope.defer(() => listeners2.delete(update));
      scope.defer(() => (clearTimeout(retryTimer), inflight?.abort()));
      scope.interval(() => refresh2(), settings4.store.refreshSec * 1000);
      scope.listen(document, "visibilitychange", () => !document.hidden && Date.now() - lastAttempt > settings4.store.refreshSec * 1000 && refresh2());
      scope.on("reply:end", () => scope.timeout(() => refresh2(true), 2500));
      scope.interval(() => panel.update(), 60000);
      refresh2(true);
    }
  });

  // src/plugins/chatNavigator/index.ts
  var logger9 = new Logger("ChatNavigator");
  var settings5 = definePluginSettings({
    showAssistant: { type: "boolean", label: { zh: "列出 Claude 的回复", en: "List Claude's replies" }, description: { zh: "关闭后目录里只有你的提问。", en: "Off lists only your prompts." }, default: true },
    minMessages: { type: "number", label: { zh: "至少几条消息才显示", en: "Show from this many messages" }, description: { zh: "默认一问一答就显示。", en: "By default one prompt and reply is enough." }, default: 2, min: 1, max: 20 },
    jumpEffect: {
      type: "select",
      label: { zh: "跳转效果", en: "Jump effect" },
      description: { zh: "跳到一条消息后怎样提示它的位置。", en: "How the message is marked after jumping to it." },
      default: "border",
      options: [
        { value: "border", label: { zh: "高亮边框", en: "Highlight border" } },
        { value: "none", label: { zh: "无", en: "None" } }
      ]
    },
    keys: { type: "boolean", label: { zh: "键盘跳转", en: "Keyboard" }, description: { zh: "输入框外 ↑ / ↓ 跳转，Home / End 到首尾。", en: "Outside the input: ↑ / ↓, Home / End." }, default: true }
  });
  var L11 = {
    title: { zh: "对话目录", en: "Outline" },
    streaming: { zh: "正在回复…", en: "Replying…" },
    empty: { zh: "（空消息）", en: "(empty)" },
    goTo: { zh: "跳到第 {n} 条，共 {total} 条", en: "Go to message {n} of {total}" }
  };
  var CSS5 = `
.rail { position: fixed; display: flex; align-items: center; pointer-events: none; }
.ticks { display: flex; flex-direction: column; align-items: flex-end; max-height: 100%; overflow: hidden; pointer-events: auto; scrollbar-width: none; }
.ticks::-webkit-scrollbar { display: none; }
.tick { display: flex; align-items: center; justify-content: flex-end; flex: none; width: 20px; height: 12px; padding: 0 2px 0 0; border: 0; background: transparent; }
.dense .tick { height: 7px; }
.tick::after { content: ""; display: block; height: 1px; width: 6px; border-radius: 999px; background: color-mix(in srgb, var(--fg3) 60%, transparent); transition: width .15s ease, background-color .15s ease; }
.tick.assistant::after { width: 12px; }
.tick.current::after { width: 16px; background: var(--fg); }
.tick.marked::after { background: #ff7a17; }
.tick.live::after { height: 0; background: none; border-top: 1px dashed color-mix(in srgb, var(--fg3) 70%, transparent); }
.tick.live.current::after { border-top-color: var(--fg); }
.rail:hover .tick::after { background: color-mix(in srgb, var(--fg3) 85%, transparent); }
.rail:hover .tick.current::after { background: var(--fg); }
.rail:hover .tick.marked::after { background: #ff7a17; }
.menu { position: absolute; top: 50%; right: calc(100% + 4px); width: min(288px, 70vw); max-height: var(--menu-h, 70vh); overflow: auto; padding: 6px; border-radius: 20px; background: var(--bg); box-shadow: var(--shadow); color: var(--fg); pointer-events: auto;
  opacity: 0; visibility: hidden; transform: translate(8px, -50%); transition: opacity .2s ease, visibility .2s ease, transform .2s ease; overscroll-behavior: contain; }
.rail.open .menu { opacity: 1; visibility: visible; transform: translate(0, -50%); }
.meta { position: sticky; top: -6px; z-index: 2; margin: -6px -6px 0; padding: 10px 16px 6px; background: var(--bg); border-radius: 20px 20px 0 0; color: var(--fg2); font-size: var(--fs-xs); letter-spacing: -.2px; font-variant-numeric: tabular-nums; }
.list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.item { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 8px; border: 1px solid transparent; border-radius: 12px; background: transparent; color: var(--fg2); font-size: var(--fs); line-height: 1.4; letter-spacing: -.2px; text-align: start; }
.item:hover, .item:focus-visible, .item.aim { background: var(--bg2); color: var(--fg); box-shadow: none; }
.item.active { color: var(--fg); border-color: var(--line); }
.emoji { flex: none; font-size: 15px; line-height: 1; }
.label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.label.dim { color: var(--fg3); font-style: italic; }
.star { flex: none; color: #ff7a17; font-size: 12px; }
@media (prefers-reduced-motion: reduce) { .menu, .tick::after { transition: none; } }
`;
  var seen2 = new Map;
  var flat = (text) => text.replace(/\s+/g, " ").trim();
  function alignWithApi(items, api) {
    if (!api.length || !items.length)
      return items;
    const keys = api.map((m) => flat(m.text).slice(0, 24));
    const anchors = [];
    let from = 0;
    for (const item of items) {
      if (!item.text)
        continue;
      const text = flat(item.text);
      for (let j = from;j < api.length; j++) {
        if (keys[j].length >= 4 && text.includes(keys[j])) {
          anchors.push([item.index, j]);
          from = j + 1;
          break;
        }
      }
    }
    const offsetFor = (index) => {
      if (!anchors.length)
        return api.length - items.length;
      let best = anchors[0];
      for (const anchor of anchors)
        if (Math.abs(anchor[0] - index) < Math.abs(best[0] - index))
          best = anchor;
      return best[1] - best[0];
    };
    const last = anchors.length ? anchors[anchors.length - 1][0] : -1;
    return items.flatMap((item) => {
      const message = api[item.index + offsetFor(item.index)];
      if (message?.notice)
        return [];
      if (!message)
        return item.text || item.index <= last ? [item] : [];
      return [{ index: item.index, role: message.role, text: item.text || message.text }];
    });
  }
  function outlineFromApi(api, rows) {
    const pos = new Map(api.map((m, i) => [m.id, i]));
    const anchors = rows.filter((r) => r.entry && pos.has(r.entry)).map((r) => [pos.get(r.entry), r.index]);
    if (!anchors.length)
      return null;
    const sorted = [...anchors].sort((a, b) => a[0] - b[0]);
    const [p0, r0] = sorted[0];
    const [pn, rn] = sorted[sorted.length - 1];
    const rowFor = (i) => {
      if (i < p0)
        return p0 <= r0 ? r0 - (p0 - i) : Math.floor(r0 * i / p0);
      if (i > pn)
        return rn + (i - pn);
      let k = 0;
      while (k < sorted.length - 1 && sorted[k + 1][0] < i)
        k++;
      const [pa, ra] = sorted[k];
      const [pb, rb] = sorted[Math.min(k + 1, sorted.length - 1)];
      if (pb === pa)
        return ra;
      return ra + Math.round((i - pa) * (rb - ra) / (pb - pa));
    };
    const out = api.flatMap((m, i) => m.notice ? [] : [{ index: rowFor(i), role: m.role, text: m.text, entry: m.id, seq: i }]);
    const lastRow = Math.max(...anchors.map((a) => a[1]));
    let extra = api.length;
    for (const row of rows)
      if (row.entry && !pos.has(row.entry) && row.text && row.index > lastRow)
        out.push({ ...row, seq: extra++ });
    return out.sort((a, b) => a.index - b.index);
  }
  function paneRight(scroller) {
    const side = scroller.closest('[data-perf-region="side_pane"]');
    let right = scroller.getBoundingClientRect().right;
    if (side)
      right = side.getBoundingClientRect().right;
    else {
      const otherSide = document.querySelector('[data-perf-region="side_pane"]');
      const limit = otherSide && otherSide.getBoundingClientRect().width > 0 ? otherSide.getBoundingClientRect().left : window.innerWidth;
      for (let el = scroller.parentElement;el && el !== document.body; el = el.parentElement) {
        const r = el.getBoundingClientRect();
        if (r.right > limit + 1 || el.contains(otherSide))
          break;
        right = Math.max(right, r.right);
        if (el.tagName === "MAIN")
          break;
      }
    }
    for (let el = scroller;el && el !== document.body; el = el.parentElement) {
      const bar = el.offsetWidth - el.clientWidth;
      if (bar > 0 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        if (Math.abs(el.getBoundingClientRect().right - right) <= 1)
          right -= Math.min(bar, 8);
        break;
      }
    }
    return right;
  }
  var outlineKey = (items) => items.map((i) => `${i.index}:${i.role}:${i.text.length}`).join("|");
  var paneOf = (scroller) => scroller.closest('[data-perf-region="side_pane"]') ? "side" : "main";
  function keyFor2(scroller) {
    if (paneOf(scroller) === "main")
      return currentRoute().chatId ?? `${location.pathname}|main`;
    return `${location.pathname}?thread=${new URLSearchParams(location.search).get("thread") ?? ""}|side`;
  }
  function transcripts() {
    const all = getScrollers();
    return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
  }
  var OPEN_DELAY_MS = 180;
  var chatNavigator_default = definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
      zh: "把对话右侧做成 Notion 式目录：细刻度标出每条提问和回复，悬停展开全部消息（包括长对话里还没渲染的），点击跳转；正在输出的回复显示为虚线。普通对话和 Claude Code 项目页都能用，项目页的主对话和线程侧栏各有一套，贴着各自的右边缘。",
      en: "A Notion-style outline on the right of the chat: thin ticks for every prompt and reply, hover to list them all (also ones not rendered yet), click to jump; a reply still streaming shows as a dashed tick. On Claude Code project pages the project chat and the thread pane each get their own, flush with their right edge."
    },
    category: "navigation",
    icon: "list",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["TranscriptApi", "RouterApi", "ChatStateApi"],
    settings: settings5,
    start(scope) {
      const { box } = createHost(scope, "navigator", CSS5, { layer: "page" });
      const navs = new Map;
      const createNav = (scroller) => {
        const ticks = h("div", { class: "ticks", role: "navigation", "aria-label": t(L11.title) });
        const meta = h("div", { class: "meta" });
        const list = h("ul", { class: "list", role: "menu", "aria-label": t(L11.title) });
        const menu = h("div", { class: "menu" }, meta, list);
        const rail = h("div", { class: "rail" }, menu, ticks);
        box.append(rail);
        const chatId = paneOf(scroller) === "main" ? currentRoute().chatId : null;
        const channelId = /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(location.pathname)?.[1] ?? null;
        const threadId = paneOf(scroller) === "side" ? new URLSearchParams(location.search).get("thread") : null;
        let api = [];
        let apiLoading = false;
        const loadApi = (force = false) => {
          if (!channelId || apiLoading)
            return;
          apiLoading = true;
          getChannelMessages(channelId, threadId, force).then((messages) => {
            api = messages;
            const next = fromDom();
            if (outlineKey(next) === outlineKey(items))
              return;
            items = next;
            draw();
          }).catch((error) => logger9.debug("Project messages unavailable:", error)).finally(() => apiLoading = false);
        };
        let items = [];
        let current = null;
        let aim = -1;
        let loadToken = 0;
        let hideTimer;
        const known = (i) => !!chatId || !!i.text.trim() || isLive(i);
        const shown = () => items.filter((i) => known(i) && (settings5.store.showAssistant || i.role === "user"));
        const key = keyFor2(scroller);
        const feedKey = () => key;
        const harvest = () => {
          const key = feedKey();
          let memo = seen2.get(key);
          if (!memo)
            seen2.set(key, memo = new Map);
          for (const row of getRows(scroller)) {
            const text = rowText(row.el);
            if (text || !memo.has(row.index))
              memo.set(row.index, { index: row.index, role: row.role, text, entry: row.entry });
          }
          return memo;
        };
        const fromDom = () => {
          const memo = harvest();
          const total = Math.max(totalMessages(scroller) ?? 0, memo.size ? Math.max(...memo.keys()) + 1 : 0);
          const rows = Array.from({ length: total }, (_, index) => memo.get(index) ?? { index, role: index % 2 === 0 ? "user" : "assistant", text: "" });
          if (!channelId)
            return rows;
          return outlineFromApi(api, [...memo.values()]) ?? alignWithApi(rows, api);
        };
        const load = async (force = false) => {
          const token = ++loadToken;
          if (!chatId) {
            const next = fromDom();
            if (outlineKey(next) !== outlineKey(items)) {
              items = next;
              draw();
            }
            loadApi(force);
            return;
          }
          try {
            const conversation = await loadConversation(chatId, force);
            if (token !== loadToken || !conversation)
              return;
            items = conversation.messages.map((m, index) => ({ index, role: m.role, text: m.text }));
          } catch (error) {
            logger9.warn("Falling back to the page for the outline:", error);
            if (token !== loadToken)
              return;
            items = fromDom();
          }
          const total = totalMessages(scroller);
          if (total && total > items.length)
            items = [...items, ...fromDom().slice(items.length)];
          draw();
        };
        const visible = () => scroller.isConnected && scroller.clientHeight > 0 && shown().length >= settings5.store.minMessages;
        const place = () => {
          if (!visible()) {
            rail.style.display = "none";
            setOpen(false);
            return;
          }
          rail.style.display = "";
          const rect = scroller.getBoundingClientRect();
          const height = Math.max(120, rect.height - 48);
          rail.style.right = `${Math.max(0, window.innerWidth - paneRight(scroller))}px`;
          rail.style.top = `${rect.top + rect.height / 2 - height / 2}px`;
          rail.style.height = `${height}px`;
          rail.style.setProperty("--menu-h", `${Math.min(window.innerHeight * 0.7, height)}px`);
          rail.classList.toggle("dense", shown().length * 12 > height);
        };
        const isLive = (item) => chatPhase() === "streaming" && item.role === "assistant" && item.index === items.length - 1;
        const label = (item) => {
          if (item.text.trim())
            return { text: snippet(item.text, 120), dim: false };
          if (isLive(item))
            return { text: t(L11.streaming), dim: true };
          return { text: t(L11.empty), dim: true };
        };
        let currentEntry = null;
        let pinned = null;
        const unpin = () => {
          if (!pinned)
            return;
          pinned = null;
          current = null;
          syncCurrent();
        };
        for (const type of ["wheel", "touchstart", "pointerdown", "keydown"])
          scroller.addEventListener(type, unpin, { passive: true });
        const activePos = () => {
          const entries = shown();
          if (pinned) {
            const at = entries.findIndex((item) => pinned.entry ? item.entry === pinned.entry : item.index === pinned.index);
            if (at >= 0)
              return at;
          }
          if (entries.length && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 4 && scroller.scrollHeight > scroller.clientHeight)
            return entries.length - 1;
          if (current === null)
            return -1;
          let pos = -1;
          const seq = currentEntry ? api.findIndex((m) => m.id === currentEntry) : -1;
          if (seq >= 0 && entries.some((item) => item.seq !== undefined)) {
            entries.forEach((item, i) => item.seq !== undefined && item.seq <= seq && (pos = i));
            return Math.max(pos, 0);
          }
          entries.forEach((item, i) => item.index <= current && (pos = i));
          return pos;
        };
        const draw = () => {
          clear(ticks);
          const entries = shown();
          const stars = getMarks("stars");
          const active = activePos();
          entries.forEach((item, i) => {
            const tick = h("button", {
              type: "button",
              class: `tick ${item.role}${i === active ? " current" : ""}${stars.has(item.index) ? " marked" : ""}${isLive(item) ? " live" : ""}`,
              "aria-label": t(L11.goTo).replace("{n}", String(i + 1)).replace("{total}", String(entries.length))
            });
            tick.addEventListener("click", () => go(i));
            ticks.appendChild(tick);
          });
          ticks.children[active]?.scrollIntoView({ block: "nearest" });
          if (rail.classList.contains("open"))
            drawMenu(false);
          place();
        };
        const drawMenu = (reveal) => {
          const keep = list.scrollTop;
          const entries = shown();
          const stars = getMarks("stars");
          const active = activePos();
          meta.textContent = `${Math.max(active, 0) + 1} / ${entries.length}`;
          clear(list);
          entries.forEach((item, i) => {
            const { text, dim } = label(item);
            const row = h("button", { type: "button", role: "menuitem", class: `item${i === active ? " active" : ""}${i === aim ? " aim" : ""}` }, h("span", { class: "emoji", text: item.role === "user" ? "❓" : "\uD83E\uDD16" }), h("span", { class: `label${dim ? " dim" : ""}`, text }), stars.has(item.index) ? h("span", { class: "star", text: "★" }) : null);
            row.addEventListener("click", () => go(i));
            list.appendChild(h("li", {}, row));
          });
          if (reveal)
            list.children[aim >= 0 ? aim : active]?.scrollIntoView({ block: "nearest" });
          else
            list.scrollTop = keep;
        };
        const go = (pos) => {
          const item = shown()[pos];
          if (!item)
            return;
          current = item.index;
          currentEntry = item.entry ?? null;
          pinned = { index: item.index, entry: item.entry };
          aim = pos;
          draw();
          if (rail.classList.contains("open"))
            drawMenu(true);
          jumpTo(item.index, { flash: settings5.store.jumpEffect === "border", scroller, entry: item.entry });
        };
        const setOpen = (open) => {
          clearTimeout(hideTimer);
          if (open === rail.classList.contains("open"))
            return;
          rail.classList.toggle("open", open);
          if (open)
            drawMenu(true);
          else
            aim = -1;
        };
        let openTimer;
        for (const el of [ticks, menu]) {
          el.addEventListener("mouseenter", () => {
            clearTimeout(hideTimer);
            clearTimeout(openTimer);
            if (el === menu || rail.classList.contains("open"))
              setOpen(true);
            else
              openTimer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
          });
          el.addEventListener("mouseleave", () => {
            clearTimeout(openTimer);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setOpen(false), 200);
          });
        }
        let lastActive = -2;
        const syncCurrent = () => {
          const next = pinned ? current : currentIndex(scroller);
          if (next === current && activePos() === lastActive)
            return;
          current = next;
          currentEntry = next === null ? null : getRows(scroller).find((row) => row.index === next)?.entry ?? null;
          const active = activePos();
          lastActive = active;
          [...ticks.children].forEach((tick, i) => tick.classList.toggle("current", i === active));
          ticks.children[active]?.scrollIntoView({ block: "nearest" });
          [...list.querySelectorAll(".item")].forEach((row, i) => row.classList.toggle("active", i === active));
          if (rail.classList.contains("open"))
            meta.textContent = `${Math.max(active, 0) + 1} / ${shown().length}`;
        };
        const onScroll = () => {
          syncCurrent();
          if (chatId)
            return;
          const next = fromDom();
          if (outlineKey(next) !== outlineKey(items)) {
            items = next;
            draw();
          }
        };
        let seenTotal = null;
        const tick = () => {
          place();
          const total = totalMessages(scroller);
          if (total && total !== seenTotal && (channelId ? true : total !== items.length)) {
            const grew = seenTotal !== null && total > seenTotal;
            seenTotal = total;
            load(grew || total > items.length);
          }
          syncCurrent();
        };
        const step = (event) => {
          const entries = shown();
          let target = null;
          const at = activePos();
          if (event.key === "Home" || (event.metaKey || event.ctrlKey) && event.key === "ArrowUp")
            target = 0;
          else if (event.key === "End" || (event.metaKey || event.ctrlKey) && event.key === "ArrowDown")
            target = entries.length - 1;
          else if (event.key === "ArrowUp" && !event.shiftKey)
            target = Math.max(0, at - 1);
          else if (event.key === "ArrowDown" && !event.shiftKey)
            target = Math.min(entries.length - 1, at + 1);
          if (target === null || target === at)
            return;
          event.preventDefault();
          go(target);
        };
        const close = () => {
          if (!rail.classList.contains("open"))
            return false;
          setOpen(false);
          return true;
        };
        const dispose = () => {
          clearTimeout(hideTimer);
          clearTimeout(openTimer);
          for (const type of ["wheel", "touchstart", "pointerdown", "keydown"])
            scroller.removeEventListener(type, unpin);
          loadToken++;
          rail.remove();
        };
        load();
        return { key: feedKey(), scroller, rail, load, draw, place, tick, onScroll, visible, step, close, dispose };
      };
      const sync = () => {
        const live = transcripts();
        for (const [el, nav] of navs) {
          if (live.includes(el) && keyFor2(el) === nav.key)
            continue;
          nav.dispose();
          navs.delete(el);
        }
        for (const el of live)
          if (!navs.has(el))
            navs.set(el, createNav(el));
      };
      const reset = () => {
        for (const nav of navs.values())
          nav.dispose();
        navs.clear();
        sync();
      };
      scope.defer(() => {
        for (const nav of navs.values())
          nav.dispose();
        navs.clear();
      });
      let scrollQueued = false;
      const dirty = new Set;
      scope.listen(document, "scroll", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement)
          dirty.add(target);
        if (scrollQueued)
          return;
        scrollQueued = true;
        requestAnimationFrame(() => {
          scrollQueued = false;
          sync();
          for (const [el, nav] of navs)
            if ([...dirty].some((d) => d === el || el.contains(d) || d.contains(el)))
              nav.onScroll();
          dirty.clear();
        });
      }, { capture: true, passive: true });
      scope.listen(window, "resize", () => navs.forEach((nav) => nav.place()));
      onRoute(scope, () => {
        reset();
        scope.timeout(reset, 300);
      });
      scope.on("reply:end", () => scope.timeout(() => navs.forEach((nav) => nav.load(true)), 800));
      onMarksChange(scope, () => navs.forEach((nav) => nav.draw()));
      scope.interval(() => {
        sync();
        navs.forEach((nav) => nav.tick());
      }, 1200);
      if (settings5.store.keys) {
        scope.listen(document, "keydown", (event) => {
          if (event.altKey || event.isComposing)
            return;
          if (isEditable(event.target) || isEditable(document.activeElement))
            return;
          const focus = getScroller();
          const nav = (focus && [...navs.values()].find((n) => n.scroller === focus || n.scroller.contains(focus) || focus.contains(n.scroller))) ?? [...navs.values()][0];
          if (!nav?.visible())
            return;
          if (event.key === "Escape") {
            if (nav.close())
              event.preventDefault();
            return;
          }
          nav.step(event);
        });
      }
    }
  });

  // src/plugins/messageStars/store.ts
  var isStar = (v) => v && typeof v.key === "string" && Number.isInteger(v.index) && (v.role === "user" || v.role === "assistant") && typeof v.text === "string" && typeof v.at === "number";
  function isBook(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    return Object.values(value).every((chat) => chat && typeof chat.title === "string" && (chat.url === undefined || typeof chat.url === "string") && Array.isArray(chat.stars) && chat.stars.every(isStar));
  }
  var book = persisted("message-stars", {}, isBook);
  var starsFor = (chatId) => chatId ? book.get()[chatId]?.stars ?? [] : [];
  function toggleStar(chatId, title, star, current = book.get(), url) {
    const chat = current[chatId] ?? { title, stars: [] };
    const exists = chat.stars.some((s) => s.key === star.key);
    const stars = exists ? chat.stars.filter((s) => s.key !== star.key) : [...chat.stars, star].sort((a, b) => a.index - b.index);
    const next = { ...current };
    const href = url ?? chat.url;
    if (stars.length)
      next[chatId] = { title: title || chat.title, stars, ...href ? { url: href } : {} };
    else
      delete next[chatId];
    return { next, starred: !exists };
  }
  function reindex(current, chatId, seen) {
    const chat = current[chatId];
    if (!chat?.stars.some((s) => seen.has(s.key) && seen.get(s.key) !== s.index))
      return null;
    const stars = chat.stars.map((s) => seen.has(s.key) ? { ...s, index: seen.get(s.key) } : s).sort((a, b) => a.index - b.index);
    return { ...current, [chatId]: { ...chat, stars } };
  }
  function chatKeyFor(path, search, inSidePane) {
    const chat = /^\/chat\/([0-9a-f-]{36})/i.exec(path);
    if (chat)
      return { key: chat[1].toLowerCase(), url: `/chat/${chat[1].toLowerCase()}` };
    const project = /^\/code\/project\/([\w-]+)/.exec(path);
    if (project) {
      const thread = new URLSearchParams(search).get("thread");
      if (inSidePane && thread)
        return { key: `${project[1]}:${thread}`, url: `/code/project/${project[1]}?thread=${encodeURIComponent(thread)}` };
      return inSidePane ? null : { key: project[1], url: `/code/project/${project[1]}` };
    }
    const code = /^\/code\/([\w-]+)\/?$/.exec(path);
    if (code && code[1] !== "project")
      return { key: code[1], url: `/code/${code[1]}` };
    return null;
  }

  // src/plugins/messageStars/index.ts
  var settings6 = definePluginSettings({
    headerButton: { type: "boolean", label: { zh: "在对话标题栏显示收藏列表按钮", en: "Starred list button in the chat header" }, default: true }
  });
  var L12 = {
    star: { zh: "收藏这条消息", en: "Star this message" },
    unstar: { zh: "取消收藏", en: "Unstar" },
    list: { zh: "收藏的消息", en: "Starred messages" },
    none: { zh: "还没有收藏。悬停消息，点操作栏里的 ☆。", en: "Nothing starred yet. Hover a message and click ☆ in its action bar." },
    you: { zh: "你", en: "You" }
  };
  var CSS6 = `
.ccpp-star-btn:not(.ccpp-native) { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); cursor: pointer; }
.ccpp-star-btn:not(.ccpp-native):hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
/* Like void++: a starred message is marked only by its star, orange on a faint orange tint; the message itself is left alone. */
.ccpp-star-btn.on { color: #ff7a17; background: rgb(255 122 23 / 14%); opacity: 1; }
.ccpp-star-btn.on:hover, .ccpp-star-btn.on:focus-visible { color: #ff7a17; background: rgb(255 122 23 / 22%); }
`;
  var LIST_CSS = `.sec { font-size: 12px; color: var(--fg3); padding: 2px 8px; } .star { color: #ff7a17; flex: none; }`;
  function rowInfo(row) {
    const index = Number(row.dataset.index);
    const message = row.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
    if (!Number.isFinite(index) || !message)
      return null;
    const role = message.matches(SEL.userMessage) ? "user" : "assistant";
    const keyed = row.querySelector("[data-turn-key]");
    const entry = row.querySelector("[data-epitaxy-entry]")?.dataset.epitaxyEntry;
    const key = keyed?.dataset.turnKey ? `${keyed.dataset.turnKey}:${role}` : entry ? `${entry}:${role}` : `i${index}`;
    const body = role === "user" ? message.querySelector(SEL.userMessageBody) ?? message : message.querySelector(SEL.prose) ?? message;
    let text = body.innerText ?? "";
    for (const el of body.querySelectorAll('button, [role="button"], [role="status"]')) {
      const extra = el.innerText?.trim();
      if (extra)
        text = text.replace(extra, "");
    }
    return { index, role, key, text: snippet(text, 200) };
  }
  var SIDE_PANE = '[data-perf-region="side_pane"]';
  var keyOf = (el) => chatKeyFor(location.pathname, location.search, !!el?.closest(SIDE_PANE));
  var pageKeys = () => [keyOf(null), document.querySelector(SIDE_PANE) ? chatKeyFor(location.pathname, location.search, true) : null].filter((k) => k !== null);
  var isPlaceholder = (button) => /^Show message actions/i.test(button.getAttribute("aria-label") ?? "") || button.getBoundingClientRect().width < 4;
  var SEL_COMPOSER = 'textarea, [contenteditable="true"], [role="textbox"], form';
  var nativeButtons = (el) => [...el.querySelectorAll("button:not(.ccpp-star-btn)")].filter((b) => !isPlaceholder(b));
  function starSpot(toolbar) {
    if (!nativeButtons(toolbar).length || toolbar.closest(SEL_COMPOSER) || toolbar.querySelector(SEL_COMPOSER))
      return null;
    const hosts = [toolbar];
    for (let el = toolbar.nextElementSibling;el; el = el.nextElementSibling) {
      if (el.classList.contains("ccpp-star-btn"))
        continue;
      if (el.matches(SEL_COMPOSER) || el.querySelector(SEL_COMPOSER))
        break;
      hosts.push(el);
    }
    for (const host of hosts.reverse()) {
      const native = nativeButtons(host).pop() ?? (host.matches("button:not(.ccpp-star-btn)") && !isPlaceholder(host) ? host : undefined);
      if (!native)
        continue;
      if (host !== toolbar)
        return { native, after: host };
      let after = native;
      while (after.parentElement && after.parentElement !== toolbar)
        after = after.parentElement;
      return { native, after };
    }
    return null;
  }
  var messageStars_default = definePlugin({
    name: "MessageStars",
    title: { zh: "消息收藏", en: "Message stars" },
    description: {
      zh: "在消息操作栏加一个 ☆，收藏任意提问或回复；标题栏按钮列出本对话（及其它对话）的收藏，点击跳回原处。对话目录里收藏的刻度显示为橙色。",
      en: "Adds ☆ to message actions to star any prompt or reply; a header button lists this chat's (and other chats') stars and jumps back. Starred ticks are orange in the navigator."
    },
    category: "messages",
    icon: "star",
    enabledByDefault: true,
    dependencies: ["DomApi", "StylesApi", "SlotsApi", "TranscriptApi", "RouterApi", "ChatStateApi"],
    settings: settings6,
    start(scope) {
      addStyle(scope, CSS6, "stars");
      const isStarred = (row, key) => starsFor(keyOf(row)?.key ?? null).some((s) => s.key === key);
      const toggle = (row) => {
        const chat = keyOf(row);
        const info = rowInfo(row);
        if (!chat || !info)
          return;
        const { next } = toggleStar(chat.key, chatTitle(), { ...info, at: Date.now() }, book.get(), chat.url);
        book.set(next);
      };
      const paint = (track = false) => {
        const starred = new Map;
        const seen = new Map;
        for (const row of document.querySelectorAll(SEL.transcriptRow)) {
          const info = rowInfo(row);
          const chat = keyOf(row)?.key ?? "";
          if (!starred.has(chat))
            starred.set(chat, new Set(starsFor(chat || null).map((s) => s.key)));
          const on = !!info && starred.get(chat).has(info.key);
          row.classList.toggle("ccpp-starred-row", on);
          if (on && chat) {
            if (!seen.has(chat))
              seen.set(chat, new Map);
            seen.get(chat).set(info.key, info.index);
          }
          for (const btn of row.querySelectorAll(".ccpp-star-btn")) {
            btn.classList.toggle("on", on);
            btn.setAttribute("data-ccpp-tip", t(on ? L12.unstar : L12.star));
            btn.setAttribute("aria-pressed", String(on));
            btn.setAttribute("aria-label", t(on ? L12.unstar : L12.star));
          }
        }
        setMarks("stars", starsFor(keyOf(null)?.key ?? null).map((s) => s.index));
        if (!track)
          return;
        let next = book.get();
        for (const [chat, keys] of seen)
          next = reindex(next, chat, keys) ?? next;
        if (next !== book.get())
          book.set(next);
      };
      const makeButton = (row, extra = "", native) => {
        const info = rowInfo(row);
        const on = !!info && isStarred(row, info.key);
        const glyph = native?.querySelector('svg, [data-cds="Icon"]')?.getBoundingClientRect();
        const size = glyph && glyph.width >= 12 && glyph.width <= 24 ? Math.round(glyph.width) : 15;
        const svg = icon("star", size);
        if (native)
          svg.setAttribute("stroke-width", "1.5");
        const btn = h("button", { type: "button", class: `ccpp-star-btn${extra}${on ? " on" : ""}`, ...tipAttrs(t(on ? L12.unstar : L12.star)), "aria-label": t(on ? L12.unstar : L12.star), "aria-pressed": String(on) }, svg);
        if (native) {
          btn.className = `${native.className} ccpp-star-btn ccpp-native${extra}${on ? " on" : ""}`;
          for (const attr of [...native.attributes])
            if (attr.name.startsWith("data-cds") || attr.name === "data-size")
              btn.setAttribute(attr.name, attr.value);
        }
        return btn;
      };
      const starAt = (event) => event.composedPath().find((n) => n instanceof HTMLElement && n.classList.contains("ccpp-star-btn"));
      const press = (star) => {
        const row = star.closest(SEL.transcriptRow);
        if (row)
          toggle(row);
      };
      scope.listen(document, "pointerdown", (event) => {
        const star = event.button === 0 ? starAt(event) : undefined;
        if (!star)
          return;
        event.preventDefault();
        event.stopPropagation();
        press(star);
      }, { capture: true });
      for (const type of ["mousedown", "pointerup", "mouseup"]) {
        scope.listen(document, type, (event) => starAt(event) && (event.preventDefault(), event.stopPropagation()), { capture: true });
      }
      scope.listen(document, "click", (event) => {
        const star = starAt(event);
        if (!star)
          return;
        event.preventDefault();
        event.stopPropagation();
        if (event.detail === 0)
          press(star);
      }, { capture: true });
      let paintTimer = 0;
      const schedulePaint = () => {
        clearTimeout(paintTimer);
        paintTimer = window.setTimeout(() => paint(true), 300);
      };
      scope.defer(() => clearTimeout(paintTimer));
      watch(scope, SEL.transcriptRow, (row) => {
        schedulePaint();
        let btn = null;
        const attach = () => {
          if (!rowInfo(row))
            return;
          const toolbar = row.querySelector(SEL.messageActions) ?? row.querySelector('[role="toolbar"]');
          const spot = toolbar ? starSpot(toolbar) : null;
          if (!spot) {
            btn?.remove();
            btn = null;
            return;
          }
          if (btn?.isConnected && btn.previousElementSibling === spot.after)
            return;
          btn ??= makeButton(row, "", spot.native);
          spot.after.after(btn);
        };
        attach();
        const observer = new MutationObserver(() => attach());
        observer.observe(row, { childList: true, subtree: true });
        row.classList.toggle("ccpp-starred-row", (() => {
          const info = rowInfo(row);
          return !!info && isStarred(row, info.key);
        })());
        return () => {
          observer.disconnect();
          btn?.remove();
          row.classList.remove("ccpp-starred-row");
        };
      });
      const list = createPopover(scope, "stars-list", LIST_CSS, 340);
      let listFrom = null;
      const keysFor = (el) => {
        const key = el?.isConnected ? keyOf(el) : null;
        return key ? [key] : el?.isConnected ? [] : pageKeys().slice(0, 1);
      };
      let pending = 0;
      const jumpWhenLoaded = async (side, star) => {
        const mine = ++pending;
        const pane = () => getScrollers().find((el) => !!el.closest(SIDE_PANE) === side) ?? null;
        const go = (scroller) => void jumpTo(star.index, { scroller, entry: star.key.replace(/:(user|assistant)$/, "") });
        const ready = pane();
        if (ready && getRows(ready).length)
          return go(ready);
        let count = 0;
        let steady = 0;
        let gaveUp = false;
        const giveUp = (e) => {
          if (!(e.target instanceof Element && e.target.closest("#ccpp-stars-list")))
            gaveUp = true;
        };
        const events = ["wheel", "touchstart", "pointerdown", "keydown"];
        for (const type of events)
          document.addEventListener(type, giveUp, { passive: true, capture: true });
        try {
          for (let waited = 0;waited < 45000 && mine === pending && !gaveUp; waited += 150) {
            await new Promise((r) => setTimeout(r, 150));
            const scroller = pane();
            const rows = scroller ? getRows(scroller).length : 0;
            steady = rows && rows === count ? steady + 150 : 0;
            count = rows;
            if (steady >= 450 && mine === pending && !gaveUp)
              return go(scroller);
          }
        } finally {
          for (const type of events)
            document.removeEventListener(type, giveUp, { capture: true });
        }
      };
      scope.defer(() => void pending++);
      const renderList = (panel, close) => {
        const stars = keysFor(listFrom).flatMap((k) => starsFor(k.key).map((star) => ({ star, side: k.key.includes(":") })));
        panel.appendChild(h("div", { class: "top" }, icon("star", 16), h("b", { text: t(L12.list) })));
        for (const { star, side } of stars) {
          const row = h("button", { type: "button", class: "item" }, h("span", { class: "star", text: "★" }), h("span", { class: "grow" }, h("div", { class: "clip2", text: star.text || "…" }), h("div", { class: "sub", text: `${star.role === "user" ? t(L12.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}` })));
          row.addEventListener("click", () => (close(), void jumpWhenLoaded(side, star)));
          panel.appendChild(row);
        }
        if (!stars.length)
          panel.appendChild(h("div", { class: "msg", text: t(L12.none) }));
      };
      const headerItems = [];
      if (settings6.store.headerButton) {
        const render = () => {
          const label = h("span");
          const btn = slotButton(t(L12.list), (event) => {
            listFrom = event.currentTarget;
            paint(true);
            list.open(listFrom, renderList);
          }, icon("star", 16), label);
          const sync = () => {
            const keys = keysFor(btn.isConnected ? btn : null);
            const count = keys.reduce((n, k) => n + starsFor(k.key).length, 0);
            label.textContent = count ? String(count) : "";
            btn.classList.toggle("on", count > 0);
            btn.hidden = location.pathname.startsWith("/code") && !keys.length;
          };
          sync();
          queueMicrotask(sync);
          return btn;
        };
        headerItems.push(addSlotItem(scope, "header", "stars", render, 10), addSlotItem(scope, "codeHeader", "stars", render, 10));
      }
      scope.defer(book.subscribe(() => {
        paint();
        for (const item of headerItems)
          refreshSlotItem(item);
        list.update();
      }));
      scope.defer(() => setMarks("stars", []));
      scope.on("route:search", () => {
        paint();
        for (const item of headerItems)
          refreshSlotItem(item);
        list.close();
      });
      onRoute(scope, () => {
        paint();
        for (const item of headerItems)
          refreshSlotItem(item);
        list.close();
      });
      paint();
    }
  });

  // src/plugins/projectStatus/index.ts
  var logger10 = new Logger("ProjectStatus");
  var settings7 = definePluginSettings({
    showCode: { type: "boolean", label: { zh: "也算上项目自身的 Code 会话", en: "Include the project's own Code session" }, description: { zh: "关闭后只看线程。", en: "Off counts threads only." }, default: true },
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    hideNative: {
      type: "boolean",
      label: { zh: "隐藏原生行尾圆点", en: "Hide claude.ai's row-end dot" },
      description: { zh: "当前打开的项目也只用图标角上的圆点，和其它项目一致。", en: "The open project then shows only the icon-corner dot, like the others." },
      default: true
    },
    refreshSec: { type: "number", label: { zh: "刷新间隔", en: "Refresh every" }, default: 30, min: 10, max: 300, step: 5, unit: "s" }
  });
  var L13 = {
    running: { zh: "运行中", en: "Running" },
    waiting: { zh: "等你回复", en: "Waiting for you" }
  };
  var PROJECT_ROW = '[data-group-list^="chan_"]';
  var ROW = "[data-row]";
  var ICON_HOLDER = ".df-leading-slot .relative, [data-leading-slot] .relative";
  var CSS7 = `
[data-ccpp-corner] { position: absolute; top: -1px; inset-inline-end: -2px; display: flex; pointer-events: none; }
[data-ccpp-corner] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; }
[data-ccpp-corner] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-corner] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-corner] .status-dot { animation: none !important; } }
`;
  function cornerKind(activity, showWaiting) {
    if (activity?.own === "working")
      return "clay";
    if (showWaiting && activity?.own === "blocked")
      return "awaiting";
    return null;
  }
  function projectKind(activity, showWaiting, withOwn) {
    if (!activity)
      return null;
    const own = withOwn ? cornerKind(activity, showWaiting) : null;
    const threads = dotKind(activity, showWaiting);
    if (own === "clay" || threads === "clay")
      return "clay";
    return own ?? threads;
  }
  function dotKind(activity, showWaiting) {
    if (!activity)
      return null;
    if (activity.working > 0)
      return "clay";
    if (showWaiting && activity.blocked > 0)
      return "awaiting";
    return null;
  }
  var projectStatus_default = definePlugin({
    name: "ProjectStatus",
    title: { zh: "项目运行状态", en: "Project status dots" },
    description: {
      zh: "在每个项目图标的右上角画状态圆点（含当前打开的项目）：有线程或 Code 会话在跑就呼吸（橙色），有线程等你回复是黄色；可隐藏 claude.ai 自己的行尾圆点。",
      en: "A status dot on every project's icon corner, the open one included: breathing orange while anything runs, yellow when a thread waits for you. claude.ai's own row-end dot can be hidden."
    },
    category: "notifications",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ClaudeApi", "DomApi", "StylesApi", "RouterApi"],
    settings: settings7,
    start(scope) {
      addStyle(scope, CSS7, "project-status");
      if (settings7.store.hideNative)
        addStyle(scope, `${PROJECT_ROW} ${ROW} > [data-row-decoration]:has(> [role="status"]) { display: none !important; }`, "project-status-native");
      const activity = new Map;
      const rows = new Map;
      let busy = false;
      const paint = (id) => {
        for (const group of rows.get(id) ?? [])
          paintGroup(id, group);
      };
      const paintGroup = (id, group) => {
        const row = group.querySelector(ROW);
        if (!row)
          return;
        const info = activity.get(id);
        row.querySelector(":scope > [data-ccpp-status]")?.remove();
        const holder = row.querySelector(ICON_HOLDER);
        const nativeCorner = holder?.querySelector(".status-dot:not([data-ccpp-corner] *), [aria-hidden] > .status-dot:not([data-ccpp-corner] *)");
        const corner = holder && !nativeCorner ? projectKind(info, settings7.store.showWaiting, settings7.store.showCode) : null;
        place(row, "[data-ccpp-corner]", corner, "data-ccpp-corner", () => holder);
      };
      const place = (row, selector, kind, attr, parent) => {
        const existing = row.querySelector(selector);
        if (!kind) {
          existing?.remove();
          return;
        }
        if (existing?.querySelector(`.status-dot[data-kind="${kind}"]`))
          return;
        existing?.remove();
        const target = parent();
        if (!target)
          return;
        const label = t(kind === "clay" ? L13.running : L13.waiting);
        target.appendChild(h("span", { [attr]: kind, ...tipAttrs(label) }, h("span", { role: "status", "aria-label": label }, h("span", { class: "status-dot", "data-kind": kind }))));
      };
      let pausedUntil = 0;
      const poll = async () => {
        if (busy || document.hidden || !rows.size || Date.now() < pausedUntil)
          return;
        busy = true;
        try {
          for (const id of [...rows.keys()]) {
            if (!scope.alive || document.hidden)
              return;
            try {
              const result = await getProjectActivity(id, scope.signal);
              activity.set(result.channelId, result);
              paint(id);
            } catch (error) {
              if (error instanceof ApiError && error.status === 429) {
                pausedUntil = Date.now() + 60000;
                logger10.debug("Project reads rate-limited; pausing a minute.");
                return;
              }
              logger10.debug("Project activity failed:", error);
            }
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        } finally {
          busy = false;
        }
      };
      let pollSoon;
      watch(scope, PROJECT_ROW, (group) => {
        const id = group.dataset.groupList;
        let groups = rows.get(id);
        if (!groups)
          rows.set(id, groups = new Set);
        groups.add(group);
        paintGroup(id, group);
        clearTimeout(pollSoon);
        pollSoon = setTimeout(poll, 300);
        const observer = new MutationObserver(() => paintGroup(id, group));
        observer.observe(group, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          groups.delete(group);
          if (!groups.size && rows.get(id) === groups)
            rows.delete(id);
          group.querySelector("[data-ccpp-status]")?.remove();
          group.querySelector("[data-ccpp-corner]")?.remove();
        };
      });
      scope.defer(() => clearTimeout(pollSoon));
      scope.interval(poll, settings7.store.refreshSec * 1000);
      onRoute(scope, () => rows.forEach((_, id) => paint(id)), false);
      scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    }
  });

  // src/plugins/inputHistory/index.ts
  var MAX_DEFAULT = 100;
  var CAPTURE_DEDUPE_MS = 2000;
  var APPLY_QUIET_MS = 300;
  var L14 = {
    title: { zh: "输入历史", en: "Input history" },
    sub: { zh: "保存在这台设备上。", en: "Stored on this device." },
    open: { zh: "浏览输入历史", en: "Browse input history" },
    openBtn: { zh: "打开", en: "Open" },
    empty: { zh: "还没有保存的提问。", en: "No stored prompts." },
    noMatch: { zh: "没有匹配的提问。", en: "No matches." },
    search: { zh: "搜索提问", en: "Search prompts" },
    stored: { zh: "已保存 {n} 条提问", en: "{n} stored prompts" },
    matches: { zh: "{n} 条匹配", en: "{n} matches" },
    clear: { zh: "清空历史", en: "Clear history" },
    clearBody: { zh: "删除这里保存的全部提问？无法撤销。", en: "Delete all stored prompts? This cannot be undone." },
    clearOk: { zh: "清空", en: "Clear" },
    use: { zh: "使用", en: "Use" },
    copy: { zh: "复制", en: "Copy" },
    remove: { zh: "删除", en: "Delete" },
    exit: { zh: "退出历史", en: "Exit history" },
    showAll: { zh: "查看输入历史（{n}）", en: "Show input history ({n})" }
  };
  var history2 = persisted("input-history", [], (v) => Array.isArray(v) && v.every((x) => typeof x === "string"));
  var settings8 = definePluginSettings({
    max: { type: "number", label: { zh: "最多保存几条", en: "Maximum stored prompts" }, default: MAX_DEFAULT, min: 10, max: 500, step: 10 },
    browse: { type: "action", label: L14.open, button: L14.openBtn, run: () => openHistory(false) },
    button: { type: "boolean", label: { zh: "在输入框旁显示历史按钮", en: "History button next to the model picker" }, default: false }
  });
  function remember(list, text, max) {
    const clean = text.replace(/​/g, "").replace(/\r\n?/g, `
`).replace(/\s+$/, "");
    if (!clean.trim() || list[0] === clean)
      return list.slice(0, max);
    return [clean, ...list].slice(0, max);
  }
  function caretAtEdge(editor, edge) {
    const selection = getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed)
      return false;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer))
      return false;
    const caret = range.getClientRects()[0] ?? range.startContainer.getBoundingClientRect?.();
    if (!caret || !caret.height && !caret.width)
      return true;
    const all = document.createRange();
    all.selectNodeContents(editor);
    const tops = [];
    for (const rect of all.getClientRects()) {
      if (rect.height < 1 && rect.width < 1)
        continue;
      if (!tops.some((top) => Math.abs(top - rect.top) < 4))
        tops.push(rect.top);
    }
    if (tops.length < 2)
      return true;
    tops.sort((x, y) => x - y);
    const line = tops.reduce((best, top, i) => Math.abs(top - caret.top) < Math.abs(tops[best] - caret.top) ? i : best, 0);
    return edge === "start" ? line === 0 : line === tops.length - 1;
  }
  function placeCaret(editor, atStart) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(atStart);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  var HUD_CSS = `
.ccpp-ih-hud { position: fixed; z-index: 2147483646; display: flex; align-items: center; gap: 2px; padding: 4px 8px; border: 1px solid var(--cds-border-subtle, rgba(127,127,127,.25)); border-radius: 8px; background: var(--cds-surface-raised, var(--cds-bg-primary, #262624)); color: var(--cds-text-secondary, #a3a3a3); font-size: 12px; font-variant-numeric: tabular-nums; line-height: 1.2; pointer-events: none; opacity: 0; transform: translate(-50%, -100%); transition: opacity .12s ease; }
.ccpp-ih-hud.on { opacity: 1; }
.ccpp-ih-hud.on button { pointer-events: auto; cursor: pointer; }
.ccpp-ih-hud button { margin: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; }
.ccpp-ih-hud .x { width: 14px; font-size: 14px; line-height: 1; }
.ccpp-ih-hud button:hover { color: var(--cds-text-primary, #fff); }
`;
  var LIST_CSS2 = `
.ih-meta { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.ih-count { flex: 1; min-width: 0; color: var(--fg3); font-size: var(--fs-sm); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ih-list { display: flex; flex-direction: column; gap: 2px; }
.ih-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 4px 6px 8px; border-radius: var(--radius); }
.ih-item:hover, .ih-item.on { background: var(--bg2); }
.ih-item.live { box-shadow: inset 0 0 0 1px var(--field-ring); }
.ih-index { flex: none; min-width: 1.75rem; padding-top: 3px; color: var(--fg3); font-size: var(--fs-xs); font-variant-numeric: tabular-nums; text-align: right; }
.ih-main { flex: 1; min-width: 0; padding-top: 2px; cursor: pointer; white-space: pre-wrap; word-break: break-word; }
.ih-main.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ih-actions { flex: none; display: flex; gap: 0; }
.ih-empty { margin: 12px 0; color: var(--fg3); }
`;
  var cursor = -1;
  var draft = "";
  var applying = 0;
  var hudEditor = null;
  var historyOpen = false;
  var hudEl = null;
  function resetBrowse() {
    cursor = -1;
    draft = "";
    hideHud();
  }
  function fill3(editor, text, atStart) {
    applying = Date.now();
    setText(text, editor);
    const place = () => editor.isConnected && placeCaret(editor, atStart);
    requestAnimationFrame(place);
    setTimeout(place, 90);
  }
  function hud() {
    if (hudEl?.isConnected)
      return hudEl;
    const count = h("button", { type: "button", class: "count" });
    count.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openHistory(true);
    });
    const close = h("button", { type: "button", class: "x", "aria-label": t(L14.exit), text: "×" });
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      cancelBrowse(hudEditor?.isConnected ? hudEditor : getEditor());
    });
    hudEl = h("div", { class: "ccpp-ih-hud", role: "group", "aria-live": "polite", "aria-label": t(L14.title) }, count, close);
    document.body.appendChild(hudEl);
    return hudEl;
  }
  function hideHud() {
    hudEl?.classList.remove("on");
  }
  function showHud(editor) {
    const list = history2.get();
    if (historyOpen || cursor < 0 || cursor >= list.length)
      return;
    hudEditor = editor;
    const el = hud();
    const label = `${list.length - cursor} / ${list.length}`;
    const count = el.querySelector(".count");
    count.textContent = label;
    count.setAttribute("aria-label", t(L14.showAll).replace("{n}", label));
    const bar = composerBox(editor);
    const place = () => {
      if (historyOpen || !bar.isConnected || cursor < 0)
        return;
      const r = bar.getBoundingClientRect();
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top = `${r.top - 8}px`;
      el.classList.add("on");
    };
    requestAnimationFrame(place);
    setTimeout(place, 120);
    setTimeout(place, 300);
  }
  function composerBox(editor) {
    const marked = editor.closest(SEL.composer);
    if (marked)
      return marked;
    let box = editor;
    for (let el = editor.parentElement;el && el !== document.body; el = el.parentElement) {
      if (el.querySelectorAll(SEL.editor).length > 1)
        break;
      if (el.querySelector(SEL.sendButton)) {
        box = el;
        break;
      }
    }
    return box;
  }
  function cancelBrowse(editor) {
    const saved = draft;
    resetBrowse();
    if (editor?.isConnected)
      fill3(editor, saved, false);
  }
  function cycle(older, editor) {
    const list = history2.get();
    if (cursor < 0)
      draft = getText(editor);
    cursor += older ? 1 : -1;
    if (cursor < 0) {
      const saved = draft;
      resetBrowse();
      fill3(editor, saved, false);
      return;
    }
    fill3(editor, list[cursor], older);
    showHud(editor);
  }
  function openHistory(picker) {
    historyOpen = true;
    hideHud();
    let query = "";
    let open = null;
    const body = h("div");
    const search = h("input", { class: "input", type: "search", placeholder: t(L14.search), "aria-label": t(L14.search) });
    search.addEventListener("input", () => {
      query = search.value;
      draw();
    });
    const meta = h("div");
    const top = h("div", {}, h("style", { text: LIST_CSS2 }), h("p", { class: "d-desc", text: t(L14.sub) }), search, meta);
    const draw = () => {
      clear(meta);
      clear(body);
      const list = history2.get();
      const total = list.length;
      const needle = query.trim().toLowerCase();
      const rows = list.map((text, i) => ({ text, i, n: total - i })).filter((row) => !needle || row.text.toLowerCase().includes(needle));
      search.hidden = !total;
      const wipe = h("button", { type: "button", class: "btn", text: t(L14.clear), disabled: !total });
      wipe.addEventListener("click", async () => {
        if (!await confirmDialog({ title: t(L14.clear), body: t(L14.clearBody), ok: L14.clearOk, danger: true }))
          return;
        history2.set([]);
        resetBrowse();
        query = "";
        search.value = "";
        open = null;
        draw();
      });
      meta.appendChild(h("div", { class: "ih-meta" }, h("span", { class: "ih-count", text: (needle ? t(L14.matches) : t(L14.stored)).replace("{n}", String(needle ? rows.length : total)) }), wipe));
      if (!total)
        return void body.appendChild(h("p", { class: "ih-empty", text: t(L14.empty) }));
      if (!rows.length)
        return void body.appendChild(h("p", { class: "ih-empty", text: t(L14.noMatch) }));
      const listEl = h("div", { class: "ih-list" });
      for (const row of rows) {
        const expanded = open === row.i;
        const main = h("div", { class: `ih-main${expanded ? "" : " clamp"}`, role: "button", tabindex: "0", text: row.text });
        const toggle = () => {
          open = expanded ? null : row.i;
          draw();
        };
        main.addEventListener("click", toggle);
        main.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ")
            return;
          event.preventDefault();
          toggle();
        });
        const action = (name, label, run) => {
          const button = h("button", { type: "button", class: "icon-btn", "aria-label": t(label), ...tipAttrs(t(label)) }, icon(name, 16));
          button.addEventListener("click", run);
          return button;
        };
        const actions = h("div", { class: "ih-actions" });
        if (picker)
          actions.appendChild(action("pencil", L14.use, () => {
            close();
            adopt(row.text, row.i);
          }));
        actions.appendChild(action("copy", L14.copy, () => void navigator.clipboard?.writeText(row.text).catch(() => {})));
        actions.appendChild(action("trash", L14.remove, () => {
          if (open === row.i)
            open = null;
          const next = history2.get().filter((_, i) => i !== row.i);
          history2.set(next);
          if (cursor >= next.length || cursor === row.i)
            resetBrowse();
          else if (cursor > row.i)
            cursor--;
          draw();
        }));
        const live = picker && row.i === cursor;
        listEl.appendChild(h("div", { class: `ih-item${expanded ? " on" : ""}${live ? " live" : ""}` }, h("span", { class: "ih-index", text: String(row.n) }), main, actions));
      }
      body.appendChild(listEl);
      listEl.querySelector(".live")?.scrollIntoView({ block: "nearest" });
    };
    const done = () => {
      historyOpen = false;
      if (cursor >= 0 && hudEditor?.isConnected)
        showHud(hudEditor);
    };
    const close = openModal(dialogFrame({ title: t(L14.title), icon: "history", top: [top], body: [body], onClose: () => close() }), { onClose: done });
    draw();
  }
  function adopt(text, index) {
    const editor = hudEditor?.isConnected ? hudEditor : getEditor();
    if (!editor)
      return;
    if (cursor < 0)
      draft = getText(editor);
    cursor = index;
    fill3(editor, text, false);
    historyOpen = false;
    showHud(editor);
  }
  var inputHistory_default = definePlugin({
    name: "InputHistory",
    title: { zh: "输入历史", en: "Input history" },
    description: {
      zh: "像终端一样用 ↑ / ↓ 调出之前发送过的提问，Esc 恢复草稿；浏览时输入框上方显示计数，点计数打开历史列表。",
      en: "Recall previous prompts with ↑ and ↓, like a shell. Esc restores your draft. Click the counter to browse history."
    },
    category: "composer",
    icon: "history",
    enabledByDefault: true,
    dependencies: ["ComposerApi", "SlotsApi", "StylesApi", "Settings"],
    settings: settings8,
    start(scope) {
      addStyle(scope, HUD_CSS, "input-history");
      resetBrowse();
      let lastSent = { text: "", at: 0 };
      onSubmit(scope, (text) => {
        const now = Date.now();
        if (text === lastSent.text && now - lastSent.at < CAPTURE_DEDUPE_MS)
          return;
        lastSent = { text, at: now };
        history2.reload();
        history2.set(remember(history2.get(), text, settings8.store.max));
        resetBrowse();
      });
      scope.listen(document, "input", (event) => {
        if (cursor < 0 || Date.now() - applying < APPLY_QUIET_MS)
          return;
        if (!event.target?.closest?.(SEL.editor))
          return;
        resetBrowse();
      }, { capture: true });
      scope.listen(document, "keydown", (event) => {
        if (event.isComposing || event.keyCode === 229)
          return;
        if (event.key === "Escape" && !event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          if (cursor < 0 || historyOpen)
            return;
          const editor = event.target?.closest?.(SEL.editor);
          cancelBrowse(editor ?? (hudEditor?.isConnected ? hudEditor : getEditor()));
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown")
          return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || historyOpen)
          return;
        const editor = event.target?.closest?.(SEL.editor);
        if (!editor)
          return;
        const older = event.key === "ArrowUp";
        if (!event.altKey && !caretAtEdge(editor, older ? "start" : "end"))
          return;
        const list = history2.get();
        if (older ? cursor >= list.length - 1 : cursor < 0)
          return;
        event.preventDefault();
        event.stopImmediatePropagation();
        cycle(older, editor);
      }, { capture: true });
      onRoute(scope, () => resetBrowse(), false);
      scope.defer(() => {
        resetBrowse();
        hudEl?.remove();
        hudEl = null;
        hudEditor = null;
      });
      if (settings8.store.button) {
        const popover = createPopover(scope, "input-history", "", 360);
        addSlotItem(scope, "composer", "input-history", () => slotButton(t(L14.title), (event) => popover.open(event.currentTarget, (panel, close) => {
          panel.appendChild(h("div", { class: "top" }, icon("history", 16), h("b", { text: t(L14.title) })));
          const list = history2.get();
          if (!list.length)
            panel.appendChild(h("div", { class: "msg", text: t(L14.empty) }));
          list.slice(0, 50).forEach((text, i) => {
            const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow clip2", text: snippet(text, 200) }));
            item.addEventListener("click", () => {
              close();
              adopt(text, i);
            });
            panel.appendChild(item);
          });
        }), icon("history", 16)), 20);
      }
    }
  });

  // src/plugins/promptPresets/index.ts
  var settings9 = definePluginSettings({
    presets: {
      type: "text",
      label: { zh: "预设", en: "Presets" },
      description: { zh: "空行分隔，每段第一行是标题。", en: "Blank line between presets; first line is the title." },
      rows: 10,
      default: t({
        zh: `翻译成中文
把下面的内容翻译成自然流畅的中文：

逐行解释代码
逐行解释下面的代码，指出潜在问题：

总结要点
用 5 条以内的要点总结：`,
        en: `Translate to English
Translate the following into natural, fluent English:

Explain code line by line
Explain the following code line by line and point out potential problems:

Summarize
Summarize in at most 5 bullet points:`
      })
    },
    mode: {
      type: "select",
      label: { zh: "点击预设时", en: "Clicking a preset" },
      default: "insert",
      options: [
        { value: "insert", label: { zh: "插入到光标处", en: "Inserts at the caret" } },
        { value: "replace", label: { zh: "替换输入框内容", en: "Replaces the input" } }
      ]
    }
  });
  var L15 = {
    title: { zh: "提示词预设", en: "Prompt presets" },
    empty: { zh: "还没有预设，在 CC++ 设置里添加。", en: "No presets yet; add some in CC++ settings." }
  };
  function parsePresets(source) {
    return source.split(/\n\s*\n/).map((block) => block.split(`
`)).filter((lines) => lines[0]?.trim()).map(([title, ...rest]) => ({ title: title.trim(), body: (rest.join(`
`).trim() || title.trim()).replace(/\\n/g, `
`) }));
  }
  var promptPresets_default = definePlugin({
    name: "PromptPresets",
    title: L15.title,
    description: { zh: "输入框旁的预设按钮，一键插入常用提示词。", en: "A button next to the model picker that inserts saved prompts." },
    category: "composer",
    icon: "fileText",
    enabledByDefault: false,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings: settings9,
    start(scope) {
      const popover = createPopover(scope, "presets", "", 320);
      addSlotItem(scope, "composer", "presets", () => slotButton(t(L15.title), (event) => popover.open(event.currentTarget, (panel, close) => {
        panel.appendChild(h("div", { class: "top" }, icon("fileText", 16), h("b", { text: t(L15.title) })));
        const presets = parsePresets(settings9.store.presets);
        if (!presets.length)
          panel.appendChild(h("div", { class: "msg", text: t(L15.empty) }));
        for (const preset of presets) {
          const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow" }, h("div", { class: "clip", text: preset.title, style: { fontWeight: "600" } }), h("div", { class: "sub clip", text: snippet(preset.body, 80) })));
          item.addEventListener("click", () => {
            close();
            const editor = getEditor();
            if (!editor)
              return;
            if (settings9.store.mode === "replace")
              setText(preset.body, editor);
            else
              insertText(preset.body, editor);
          });
          panel.appendChild(item);
        }
      }), icon("fileText", 16)), 30);
    }
  });

  // src/plugins/replyNotification/index.ts
  var settings10 = definePluginSettings({
    when: {
      type: "select",
      label: { zh: "什么时候提醒", en: "Notify when" },
      default: "hidden",
      options: [
        { value: "hidden", label: { zh: "标签页不在前台时", en: "The tab is in the background" } },
        { value: "always", label: { zh: "每次回复完成", en: "Every reply finishes" } }
      ]
    },
    minSeconds: { type: "number", label: { zh: "回复至少持续多久才提醒", en: "Only replies longer than" }, default: 5, min: 0, max: 120, unit: "s" },
    sound: { type: "boolean", label: { zh: "提示音", en: "Sound" }, default: true },
    volume: { type: "number", label: { zh: "音量", en: "Volume" }, default: 40, min: 5, max: 100, step: 5, unit: "%", visible: (v) => v.sound === true },
    desktop: { type: "boolean", label: { zh: "系统通知", en: "Desktop notification" }, default: true },
    toast: { type: "boolean", label: { zh: "页面内提示条", en: "In-page toast" }, default: true },
    others: {
      type: "boolean",
      label: { zh: "其它对话完成也提醒", en: "Also for other chats" },
      description: { zh: "侧栏里正在回复的对话完成时弹提示条，点击打开。", en: "A toast when a chat replying in the sidebar finishes; click to open it." },
      default: true
    },
    preview: { type: "boolean", label: { zh: "提示条显示回复开头", en: "Preview the reply" }, default: true },
    keep: { type: "boolean", label: { zh: "提示条保持到手动关闭", en: "Keep toasts until dismissed" }, description: { zh: "点 × 或打开该对话才关闭。", en: "Close with × or by opening the chat." }, default: false },
    toastSec: { type: "number", label: { zh: "提示条停留", en: "Toast stays for" }, default: 6, min: 2, max: 30, unit: "s", visible: (v) => !v.keep },
    test: { type: "action", label: { zh: "试一下", en: "Try it" }, button: { zh: "发送测试提醒", en: "Send a test" }, run: () => notify2({ chatId: currentRoute().chatId, title: "CC++", durationMs: 0, at: Date.now() }, true) }
  });
  var L16 = {
    done: { zh: "Claude 回复完成", en: "Claude finished replying" },
    otherDone: { zh: "另一个对话回复完成", en: "Another chat finished" },
    otherError: { zh: "另一个对话回复出错", en: "Another chat hit an error" },
    took: { zh: "用时 {s} 秒", en: "Took {s}s" },
    open: { zh: "点击回到对话", en: "Click to return to the chat" }
  };
  function chime(volume) {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx)
      return;
    const ctx = new Ctx;
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.3;
    gain.connect(ctx.destination);
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.14;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(1, start + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(env).connect(gain);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => void ctx.close(), 1200);
  }
  var openToasts = new Map;
  function openChat(chatId) {
    window.focus();
    if (currentRoute().chatId === chatId)
      return;
    const link = document.querySelector(`a[href="/chat/${chatId}"]`);
    if (link)
      link.click();
    else
      location.assign(`/chat/${chatId}`);
  }
  function claim(chatId) {
    if (!chatId)
      return true;
    const key = `ccpp:replyNotified:${chatId}`;
    try {
      const last = Number(localStorage.getItem(key));
      if (Date.now() - last < 15000)
        return false;
      localStorage.setItem(key, String(Date.now()));
    } catch {}
    return true;
  }
  async function previewOf(chatId) {
    if (!chatId || !settings10.store.preview)
      return "";
    try {
      const reply = (await getConversation(chatId)).messages.filter((m) => m.role === "assistant").at(-1);
      return reply ? snippet(reply.text, 100) : "";
    } catch {
      return "";
    }
  }
  function notify2(event, test = false) {
    const body = [event.title, event.durationMs ? t(L16.took).replace("{s}", String(Math.round(event.durationMs / 1000))) : ""].filter(Boolean).join(" · ");
    const title = event.other ? t(event.error ? L16.otherError : L16.otherDone) : t(L16.done);
    const back = () => {
      window.focus();
      if (event.chatId)
        openChat(event.chatId);
    };
    const away = test || settings10.store.when === "always" || document.hidden || !document.hasFocus();
    if (settings10.store.sound && away)
      chime(settings10.store.volume);
    if (settings10.store.toast || event.other) {
      const key = event.chatId ? `reply-${event.chatId}` : "reply-done";
      const close = toast([body, event.preview].filter(Boolean).join(`
`), { title, kind: event.error ? "error" : "ok", onClick: back, key, timeoutMs: settings10.store.keep ? 0 : settings10.store.toastSec * 1000 });
      if (event.chatId)
        openToasts.set(event.chatId, close);
    }
    if (!away)
      return;
    if (settings10.store.desktop && "Notification" in window) {
      const show = () => {
        try {
          const n = new Notification(title, { body: `${[body, event.preview].filter(Boolean).join(`
`)}
${t(L16.open)}`, tag: `ccpp-${event.chatId ?? "reply"}`, silent: true });
          n.onclick = () => {
            back();
            n.close();
          };
        } catch {}
      };
      if (Notification.permission === "granted")
        show();
      else if (Notification.permission === "default" && test)
        Notification.requestPermission().then((p) => p === "granted" && show());
    }
  }
  function readRows(root = document) {
    const rows = new Map;
    for (const link of root.querySelectorAll('a[href^="/chat/"][data-row-main-button]')) {
      const id = /^\/chat\/([0-9a-f-]{36})/i.exec(link.getAttribute("href") ?? "")?.[1]?.toLowerCase();
      if (!id)
        continue;
      const attention = link.querySelector("[data-attention]")?.getAttribute("data-attention") ?? "";
      const state = attention === "working" ? "working" : /error|fail/i.test(attention) ? "error" : "idle";
      const label = link.querySelector("[data-row-label]");
      const shimmer = label?.querySelector('[data-cds="ShimmerText"]');
      const title = ((shimmer?.firstChild?.textContent ?? label?.textContent) || "").trim();
      const prev = rows.get(id);
      if (!prev || state === "working")
        rows.set(id, { state, title: title || prev?.title || "" });
    }
    return rows;
  }
  function finished(working, rows, now) {
    const done = [];
    for (const [chatId, row] of rows) {
      const was = working.get(chatId);
      if (row.state === "working") {
        if (!was)
          working.set(chatId, { since: now, title: row.title });
        continue;
      }
      if (!was)
        continue;
      working.delete(chatId);
      done.push({ chatId, title: row.title || was.title, durationMs: now - was.since, error: row.state === "error" });
    }
    return done;
  }
  var replyNotification_default = definePlugin({
    name: "ReplyNotification",
    title: { zh: "回复完成提醒", en: "Reply notification" },
    description: {
      zh: "Claude 回复完成时播放提示音、弹出系统通知或页面提示条（默认只在标签页处于后台时）。",
      en: "Plays a chime, shows a desktop notification or an in-page toast when Claude finishes (by default only while the tab is in the background)."
    },
    category: "notifications",
    icon: "bell",
    enabledByDefault: true,
    dependencies: ["ChatStateApi", "NoticesApi", "RouterApi", "ClaudeApi"],
    settings: settings10,
    start(scope) {
      scope.on("reply:end", (event) => {
        if (event.durationMs < settings10.store.minSeconds * 1000)
          return;
        if (settings10.store.when === "hidden" && !document.hidden && document.hasFocus())
          return;
        if (!claim(event.chatId))
          return;
        previewOf(event.chatId).then((preview) => scope.alive && notify2({ ...event, preview }));
      });
      const working = new Map;
      scope.interval(() => {
        const rows = readRows();
        for (const done of finished(working, rows, Date.now())) {
          if (!settings10.store.others || done.chatId === currentRoute().chatId)
            continue;
          if (!claim(done.chatId))
            continue;
          previewOf(done.chatId).then((preview) => scope.alive && notify2({ ...done, at: Date.now(), other: true, preview }));
        }
      }, 1000);
      onRoute(scope, (route) => {
        const close = route.chatId ? openToasts.get(route.chatId) : undefined;
        if (close) {
          close();
          openToasts.delete(route.chatId);
        }
      });
      scope.defer(() => openToasts.clear());
      if (settings10.store.desktop && "Notification" in window && Notification.permission === "default") {
        scope.listen(document, "pointerdown", () => void Notification.requestPermission(), { once: true });
      }
    }
  });

  // src/plugins/chatFavicon/index.ts
  var settings11 = definePluginSettings({
    style: {
      type: "select",
      label: { zh: "图标样式", en: "Icon style" },
      default: "hole",
      options: [
        { value: "emoji", label: { zh: "只用表情", en: "Emoji only" } },
        { value: "badge", label: { zh: "角标 + 符号", en: "Badge + glyph" } },
        { value: "dot", label: { zh: "彩色圆点", en: "Colour dot" } },
        { value: "hole", label: { zh: "图标变色", en: "Mark tint" } },
        { value: "bg", label: { zh: "背景变色", en: "Background tint" } }
      ]
    }
  });
  var COLOR = {
    streaming: "#3B82F6",
    done: "#22C55E",
    ready: "#F59E0B",
    error: "#EF4444"
  };
  var CLAY = "#D97757";
  var EMOJI = { streaming: "\uD83D\uDD04", done: "✔️", ready: "\uD83D\uDC4D", error: "\uD83D\uDEAB" };
  function fallbackMark() {
    const spokes = [];
    for (let i = 0;i < 12; i++) {
      const angle = i * Math.PI / 6;
      const length = i % 2 ? 20 : 26;
      const x = (r) => (32 + Math.cos(angle) * r).toFixed(1);
      const y = (r) => (32 + Math.sin(angle) * r).toFixed(1);
      spokes.push(`<line x1="${x(5)}" y1="${y(5)}" x2="${x(length)}" y2="${y(length)}" stroke="${CLAY}" stroke-width="6.5" stroke-linecap="round"/>`);
    }
    return { viewBox: "0 0 64 64", inner: spokes.join("") };
  }
  function parseMark(svgText) {
    const open = /<svg\b[^>]*>/i.exec(svgText);
    const close = svgText.lastIndexOf("</svg>");
    if (!open || close < 0)
      return null;
    const viewBox = /viewBox="([^"]+)"/i.exec(open[0])?.[1] ?? (() => {
      const w = /width="([\d.]+)"/.exec(open[0])?.[1];
      const hgt = /height="([\d.]+)"/.exec(open[0])?.[1];
      return w && hgt ? `0 0 ${w} ${hgt}` : null;
    })();
    const inner = svgText.slice(open.index + open[0].length, close).replace(/<script[\s\S]*?<\/script>/gi, "");
    return viewBox && inner.trim() ? { viewBox, inner } : null;
  }
  var recolor = (inner, color) => inner.replace(/\b(fill|stroke)="(?!none)[^"]*"/g, `$1="${color}"`).replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi, color);
  var place3 = (mark, inner, x = 0, y = 0, size = 64) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${mark.viewBox}">${inner}</svg>`;
  var svgUrl = (inner) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`)}`;
  function glyph2(state) {
    const s = `fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if (state === "streaming")
      return `<path d="M51.5 45.5a6 6 0 1 1-5.2 3" ${s}/>`;
    if (state === "done")
      return `<path d="M46.8 51.8l3.4 3.4 6.4-7.4" ${s}/>`;
    if (state === "ready")
      return `<path d="M51.5 56.5v-9.6M46.8 51.2l4.7-4.8 4.7 4.8" ${s}/>`;
    return `<path d="M47.3 47.3l8.4 8.4M55.7 47.3l-8.4 8.4" ${s}/>`;
  }
  function faviconFor(style, state, official, mark = null) {
    if (state === "idle")
      return official;
    const color = COLOR[state];
    if (style === "emoji")
      return svgUrl(`<text x="32" y="54" font-size="54" text-anchor="middle">${EMOJI[state]}</text>`);
    const m = mark ?? fallbackMark();
    if (style === "hole")
      return svgUrl(place3(m, recolor(m.inner, color)));
    if (style === "bg")
      return svgUrl(`<rect width="64" height="64" rx="14" fill="${color}"/>${place3(m, recolor(m.inner, "#fff"), 9, 9, 46)}`);
    const badge = style === "dot" ? `<circle cx="52" cy="52" r="11" fill="#fff"/><circle cx="52" cy="52" r="8" fill="${color}"/>` : `<circle cx="51.5" cy="51.5" r="12.5" fill="#fff"/><circle cx="51.5" cy="51.5" r="10" fill="${color}"/>${glyph2(state)}`;
    return svgUrl(place3(m, m.inner) + badge);
  }
  function computeState(facts) {
    if (facts.errored)
      return "error";
    if (facts.streaming)
      return "streaming";
    if (facts.draft)
      return "ready";
    if (facts.finished)
      return "done";
    return "idle";
  }
  var ICON_ID = "ccpp-favicon";
  var ERROR_EVENT = /^event:\s*error\s*$|"type"\s*:\s*"error"/m;
  var STOP_EVENT = /^event:\s*message_stop\s*$|"type"\s*:\s*"message_stop"/m;
  var isIconLink = (node) => node instanceof HTMLLinkElement && /\bicon\b/i.test(node.rel) && node.id !== ICON_ID;
  var isCompletion = (path) => /\/chat_conversations\/[^/]+\/(?:completion|retry_completion)$/.test(path);
  function codeProjectOf(path, search) {
    const channel = /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(path)?.[1];
    if (!channel)
      return null;
    const thread = /[?&]thread=(cmsg_[A-Za-z0-9]+)/.exec(search)?.[1] ?? null;
    return { channel, thread };
  }
  var chatFavicon_default = definePlugin({
    name: "ChatFavicon",
    title: { zh: "标签页图标状态", en: "Chat state favicon" },
    description: {
      zh: "标签页图标随对话状态变化：回复中、已完成、草稿待发送、出错（含消息发送失败），5 种样式可选。Claude Code 项目页跟随项目主对话和所有线程。",
      en: "The tab icon follows the chat: replying, done, draft ready, error (including a message that couldn't be sent). Five styles. On Claude Code project pages it follows the project chat and all its threads."
    },
    category: "notifications",
    icon: "tab",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ChatStateApi", "ClaudeApi", "ComposerApi", "NetworkApi", "RouterApi"],
    settings: settings11,
    start(scope) {
      const removed = [];
      let official = `${location.origin}/favicon.ico`;
      let mark = null;
      let markFrom = "";
      const loadMark = (href) => {
        if (!/\.svg(?:$|\?)/i.test(href) || href === markFrom)
          return;
        markFrom = href;
        fetch(href, { credentials: "omit" }).then((r) => r.ok ? r.text() : "").then((text) => {
          const parsed = parseMark(text);
          if (!parsed || !scope.alive)
            return;
          mark = parsed;
          paint();
        }).catch(() => {});
      };
      const onChatSurface = () => ["chat", "new", "project"].includes(currentRoute().kind) || !!codeProjectOf(location.pathname, location.search);
      let errored = false;
      let finished = false;
      let streaming = chatPhase() === "streaming";
      let sent = "";
      let sentAt = 0;
      const norm = (text) => text.replace(/\s+/g, " ").trim();
      const draft = () => {
        const text = norm(getText());
        return !!text && text !== sent && Date.now() - sentAt > 1500;
      };
      let state = "idle";
      const link = document.createElement("link");
      link.id = ICON_ID;
      link.rel = "icon";
      link.setAttribute("sizes", "any");
      const claim = () => {
        const head = document.head;
        if (!head)
          return;
        for (const node of [...head.querySelectorAll("link")]) {
          if (!isIconLink(node))
            continue;
          if (node.href && !node.href.startsWith("data:") && (/svg/i.test(node.type) || !/\.svg/i.test(official)))
            official = node.href;
          removed.push(node);
          node.remove();
        }
        if (head.firstChild !== link)
          head.prepend(link);
      };
      const release = () => {
        link.remove();
        for (const node of removed.splice(0))
          if (!node.isConnected)
            document.head?.appendChild(node);
      };
      const paint = () => {
        if (!onChatSurface())
          return release();
        claim();
        loadMark(official);
        const href = faviconFor(settings11.store.style, state, official, mark);
        if (link.getAttribute("href") !== href)
          link.setAttribute("href", href);
      };
      let inflight = 0;
      let pendingUntil = 0;
      let endedAt = 0;
      let codeWorking = false;
      let codeWaiting = false;
      const live = () => codeWorking || inflight > 0 || Date.now() < pendingUntil || chatPhase() === "streaming" && Date.now() - endedAt > 1e4;
      const update = () => {
        const now = live();
        if (now && !streaming) {
          errored = false;
          finished = false;
        } else if (!now && streaming)
          finished = true;
        streaming = now;
        const next = computeState({ streaming, errored, finished, draft: codeWaiting || draft() });
        if (next === state)
          return;
        state = next;
        paint();
      };
      onSubmit(scope, (text) => {
        sent = norm(text);
        sentAt = Date.now();
        errored = false;
        pendingUntil = Date.now() + 8000;
        update();
      });
      let codeChannel = "";
      let codePhases = new Map;
      let codeBusy = false;
      let codePausedUntil = 0;
      const pollCode = async () => {
        const page = codeProjectOf(location.pathname, location.search);
        if (!page) {
          codeChannel = "";
          codePhases = new Map;
          if (codeWorking || codeWaiting) {
            codeWorking = codeWaiting = false;
            update();
          }
          return;
        }
        if (codeBusy || Date.now() < codePausedUntil)
          return;
        codeBusy = true;
        try {
          const channel = page.channel;
          const phases = await getProjectPhases(channel, scope.signal);
          if (!scope.alive || page.channel !== codeProjectOf(location.pathname, location.search)?.channel)
            return;
          const previous = channel === codeChannel ? codePhases : null;
          codeChannel = channel;
          codePhases = phases;
          const all = [...phases.values()];
          codeWorking = all.includes("working");
          codeWaiting = all.includes("blocked");
          if (previous && [...phases].some(([id, phase]) => phase === "failed" && previous.get(id) !== "failed"))
            errored = true;
          update();
        } catch (error) {
          if (error instanceof ApiError && error.status === 429)
            codePausedUntil = Date.now() + 60000;
        } finally {
          codeBusy = false;
        }
      };
      scope.interval(pollCode, 4000);
      pollCode();
      scope.on("reply:start", update);
      scope.on("reply:end", update);
      scope.interval(update, 500);
      const chatKey = () => {
        const page = codeProjectOf(location.pathname, location.search);
        return page ? page.channel : currentRoute().chatId ?? null;
      };
      let chatId = chatKey();
      const onNavigate = () => {
        const next = chatKey();
        const code = next?.startsWith("chan_");
        if (next !== chatId && chatId !== null && (code || !streaming)) {
          finished = false;
          errored = false;
          if (code) {
            codeWorking = codeWaiting = false;
            streaming = false;
          }
        }
        chatId = next;
        update();
        paint();
        if (code)
          pollCode();
      };
      scope.on("route", onNavigate);
      scope.on("route:search", onNavigate);
      let inputTimer;
      scope.listen(document, "input", (event) => {
        if (!event.target?.closest?.(SEL.editor))
          return;
        clearTimeout(inputTimer);
        inputTimer = setTimeout(() => scope.alive && update(), 60);
      }, { capture: true });
      scope.defer(() => clearTimeout(inputTimer));
      const fail = () => {
        errored = true;
        update();
      };
      onRequestError(scope, (req) => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), (error) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          fail();
      });
      scope.on("send:failed", fail);
      onResponse(scope, (req) => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), async (response) => {
        inflight++;
        pendingUntil = 0;
        update();
        let open = true;
        const close = () => {
          if (!open)
            return;
          open = false;
          inflight = Math.max(0, inflight - 1);
          endedAt = Date.now();
          update();
        };
        try {
          if (!response.ok)
            return fail();
          const reader = response.body?.getReader();
          if (!reader) {
            const text = await response.text();
            if (ERROR_EVENT.test(text))
              fail();
            return;
          }
          const decoder = new TextDecoder;
          let tail = "";
          for (;; ) {
            const { done, value } = await reader.read();
            if (done)
              break;
            tail = (tail + decoder.decode(value, { stream: true })).slice(-4096);
            if (ERROR_EVENT.test(tail))
              fail();
            if (STOP_EVENT.test(tail)) {
              close();
              reader.cancel().catch(() => {});
              break;
            }
          }
        } catch {} finally {
          close();
        }
      });
      scope.observe(link, { attributes: true, attributeFilter: ["href"] }, () => {
        const want = faviconFor(settings11.store.style, state, official, mark);
        if (onChatSurface() && link.getAttribute("href") !== want)
          link.setAttribute("href", want);
      });
      if (document.head)
        scope.observe(document.head, { childList: true }, () => onChatSurface() && (!link.isConnected || [...document.head.querySelectorAll("link")].some(isIconLink)) && paint());
      scope.defer(release);
      paint();
    }
  });

  // src/plugins/widerChat/index.ts
  var settings12 = definePluginSettings({
    width: { type: "number", label: { zh: "对话最大宽度", en: "Maximum chat width" }, default: 64, min: 40, max: 160, step: 2, unit: "rem" },
    composer: { type: "boolean", label: { zh: "输入框同步加宽", en: "Widen the chat input too" }, default: true }
  });
  var widerCss = (width, composer) => `
:root { --transcript-width: ${width}rem !important; }
[data-testid="transcript-list"] { max-width: ${width}rem !important; }
${composer ? `[data-composer-card-holder], [data-cds="ChatComposer"] { max-width: ${width}rem !important; }
[data-composer-card-holder] { margin-inline: auto; }` : ""}
`;
  var widerChat_default = definePlugin({
    name: "WiderChat",
    title: { zh: "加宽对话", en: "Wider chat" },
    description: { zh: "调整对话区（以及输入框）的最大宽度，宽屏上一屏看更多。", en: "Sets the maximum width of the conversation (and the input) for wide screens." },
    category: "appearance",
    icon: "width",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings: settings12,
    start(scope) {
      const set = addStyle(scope, widerCss(settings12.store.width, settings12.store.composer), "wider-chat");
      this.onSettingsChange = () => set(widerCss(settings12.store.width, settings12.store.composer));
    }
  });

  // src/plugins/composerLook/index.ts
  var settings13 = definePluginSettings({
    opacity: { type: "number", label: { zh: "输入框背景不透明度", en: "Input background opacity" }, description: { zh: "100 为完全不透明。", en: "100 is fully opaque." }, default: 100, min: 20, max: 100, step: 5, unit: "%" },
    blur: { type: "number", label: { zh: "背景模糊", en: "Background blur" }, default: 16, min: 0, max: 40, unit: "px" },
    radius: { type: "number", label: { zh: "圆角", en: "Corner radius" }, description: { zh: "0 表示保持官方样式。", en: "0 keeps claude.ai's own radius." }, default: 0, min: 0, max: 40, unit: "px" }
  });
  var composerCss = (opacity, blur, radius) => `
[data-cds="ChatComposer"] > .bg-surface-3, [data-cds="ChatComposer"] [class*="bg-surface-3"] {
  background-color: color-mix(in srgb, var(--cds-surface-3, var(--bg-300, #fff)) ${opacity}%, transparent) !important;
  ${blur ? `backdrop-filter: blur(${blur}px) saturate(1.2); -webkit-backdrop-filter: blur(${blur}px) saturate(1.2);` : ""}
  ${radius ? `border-radius: ${radius}px !important;` : ""}
}
[data-composer-card-holder] { background: transparent !important; }
`;
  var composerLook_default = definePlugin({
    name: "ComposerLook",
    title: { zh: "输入框外观", en: "Composer look" },
    description: { zh: "调整输入框背景的不透明度、毛玻璃模糊与圆角。", en: "Tune the chat input's background opacity, frosted blur and corner radius." },
    category: "composer",
    tags: ["appearance"],
    icon: "blend",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    settings: settings13,
    start(scope) {
      const css = () => composerCss(settings13.store.opacity, settings13.store.blur, settings13.store.radius);
      const set = addStyle(scope, css(), "composer-look");
      this.onSettingsChange = () => set(css());
    }
  });

  // src/lib/identity.ts
  var ORIG_LABEL = "data-ccpp-orig-label";
  var known = "";
  function realName() {
    const avatar = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`);
    const label = (avatar?.getAttribute(ORIG_LABEL) ?? avatar?.getAttribute("aria-label") ?? "").trim();
    if (label)
      known = label;
    return known;
  }
  var identityRoots = () => [...document.querySelectorAll(SEL.userMenuButton), ...document.querySelectorAll(SEL.accountMenu)];
  function textNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode();node; node = walker.nextNode())
      out.push(node);
    return out;
  }

  class TextSwaps {
    swaps = new Map;
    set(node, ours) {
      if (node.data === ours)
        return;
      const prev = this.swaps.get(node);
      const original = prev && node.data === prev.ours ? prev.original : node.data;
      this.swaps.set(node, { original, ours });
      node.data = ours;
    }
    original(node) {
      const swap = this.swaps.get(node);
      return swap && node.data === swap.ours ? swap.original : node.data;
    }
    restore(node) {
      for (const [n, swap] of node ? [[node, this.swaps.get(node)]] : [...this.swaps]) {
        if (!swap)
          continue;
        if (n.isConnected && n.data === swap.ours)
          n.data = swap.original;
        this.swaps.delete(n);
      }
    }
    prune() {
      for (const n of this.swaps.keys())
        if (!n.isConnected)
          this.swaps.delete(n);
    }
  }
  function repaintOnChange(scope, paint) {
    let timer = null;
    const run = () => {
      timer = null;
      if (scope.alive)
        paint();
    };
    const observer = new MutationObserver(() => timer ??= setTimeout(run, 60));
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
    scope.defer(() => {
      observer.disconnect();
      if (timer)
        clearTimeout(timer);
    });
    paint();
  }

  // src/plugins/customGreeting/index.ts
  var settings14 = definePluginSettings({
    phrases: {
      type: "text",
      label: { zh: "问候语（每行一条）", en: "Greetings (one per line)" },
      description: { zh: "可用 {name}、{time}。留空保持官方问候语。", en: "Supports {name} and {time}. Empty keeps claude.ai's greeting." },
      rows: 5,
      default: t({ zh: `{time}，{name}
今天想做点什么？
灵感来了就写下来`, en: `{time}, {name}
What shall we work on today?
Write it down while the idea is fresh` })
    },
    order: {
      type: "select",
      label: { zh: "顺序", en: "Order" },
      default: "random",
      options: [
        { value: "random", label: { zh: "随机", en: "Random" } },
        { value: "sequential", label: { zh: "依次", en: "In order" } }
      ]
    },
    rotate: {
      type: "select",
      label: { zh: "什么时候换", en: "Change on" },
      default: "visit",
      options: [
        { value: "visit", label: { zh: "每次打开首页", en: "Each visit to the home page" } },
        { value: "click", label: { zh: "点击问候语", en: "Clicking the greeting" } },
        { value: "timer", label: { zh: "定时", en: "A timer" } }
      ]
    },
    intervalSec: { type: "number", label: { zh: "定时间隔", en: "Timer interval" }, default: 30, min: 5, max: 600, step: 5, unit: "s", visible: (v) => v.rotate === "timer" },
    input: {
      type: "select",
      label: { zh: "输入框占位文字", en: "Input placeholder" },
      description: { zh: "替换成下面的文字，没填就用第一条问候语。", en: "Uses the text below, or the first greeting when it's empty." },
      default: "project",
      options: [
        { value: "project", label: { zh: "只在项目里换", en: "Only in projects" } },
        { value: "all", label: { zh: "到处都换", en: "Everywhere" } },
        { value: "off", label: { zh: "不换", en: "Never" } }
      ]
    },
    placeholder: { type: "string", label: { zh: "占位文字", en: "Placeholder text" }, description: { zh: "留空用第一条问候语。", en: "Empty uses the first greeting." }, default: "", visible: (v) => v.input !== "off" }
  });
  var position = persisted("greeting-index", 0, (v) => Number.isInteger(v));
  function pickPhrase(phrases, order, last, random = Math.random) {
    if (!phrases.length)
      return { index: -1, text: "" };
    if (order === "sequential") {
      const index = (last + 1) % phrases.length;
      return { index, text: phrases[index] };
    }
    let index = Math.floor(random() * phrases.length);
    if (phrases.length > 1 && index === last)
      index = (index + 1) % phrases.length;
    return { index, text: phrases[index] };
  }
  function fillPhrase(text, name, hour, zh) {
    const time = hour < 5 ? zh ? "夜深了" : "Good night" : hour < 12 ? zh ? "早上好" : "Good morning" : hour < 18 ? zh ? "下午好" : "Good afternoon" : zh ? "晚上好" : "Good evening";
    return text.replaceAll("{name}", name).replaceAll("{time}", time);
  }
  var isProjectPage = (path) => /^\/(code\/)?project\//.test(path);
  function findGreetings(root = document) {
    const marked = [...root.querySelectorAll(SEL.greeting)];
    if (marked.length)
      return marked;
    const editor = document.querySelector(SEL.editor);
    if (!editor || document.querySelector(`${SEL.transcript}, ${SEL.userMessage}, ${SEL.assistantMessage}`))
      return [];
    const found = new Set;
    for (const spark of root.querySelectorAll(SEL.greetingSpark)) {
      const holder = spark.closest("[data-new-page-greeting-spark]") ?? spark;
      let row = holder.parentElement;
      for (let up = 0;row && up < 3 && !greetingText(row).trim(); up++)
        row = row.parentElement;
      if (!row || row.contains(editor) || row.closest(`a, button, [role="button"], ${SEL.sidebar}, ${SEL.composer}`))
        continue;
      const words = greetingText(row).trim();
      if (!words || words.length > 200 || words === "Claude")
        continue;
      found.add(row);
    }
    return [...found];
  }
  var greetingNodes = (el) => textNodes(el).filter((node) => !node.parentElement?.closest(`svg, [data-new-page-greeting-spark]`));
  var greetingText = (el) => greetingNodes(el).map((node) => node.data).join("");
  var displayName = () => document.querySelector(`${SEL.userMenuButton} [data-cds="Avatar"]`)?.getAttribute("aria-label")?.trim() || document.querySelector(`${SEL.userMenuName} span`)?.textContent?.trim() || "";
  var cssString = (text) => `"${text.replaceAll("\\", "\\\\").replaceAll('"', "\\\"").replaceAll(`
`, "\\A ")}"`;
  var placeholderCss = (text) => text ? `${SEL.editor} p.is-editor-empty[data-placeholder]::before { content: ${cssString(text)} !important; }` : "";
  var CLICKABLE = "data-ccpp-greeting-click";
  var customGreeting_default = definePlugin({
    name: "CustomGreeting",
    title: { zh: "自定义问候语", en: "Custom greeting" },
    description: { zh: "替换首页问候语（含新版首页），多条随机 / 依次轮换；项目里的输入框占位文字也换成你的。", en: "Your own home greeting (new layouts too), rotated on visit, click or a timer; project inputs get your placeholder." },
    category: "appearance",
    icon: "message",
    enabledByDefault: false,
    updatedAt: "2026-10-24",
    dependencies: ["DomApi", "RouterApi", "StylesApi"],
    settings: settings14,
    start(scope) {
      const phrases = () => settings14.store.phrases.split(`
`).map((s) => s.trim()).filter(Boolean);
      const swaps = new TextSwaps;
      addStyle(scope, `[${CLICKABLE}] { cursor: pointer; }`, "custom-greeting");
      const setPlaceholderCss = addStyle(scope, "", "custom-greeting-placeholder");
      let template = "";
      let shown = false;
      const fill = (text) => fillPhrase(text, displayName(), new Date().getHours(), /[一-龥]/.test(text));
      const next = () => {
        const pick = pickPhrase(phrases(), settings14.store.order, position.get());
        if (pick.index >= 0)
          position.set(pick.index);
        template = pick.text;
      };
      const paintGreeting = () => {
        const targets = findGreetings();
        swaps.prune();
        if (!targets.length) {
          shown = false;
          return;
        }
        if (!shown && (settings14.store.rotate === "visit" || !template))
          next();
        shown = true;
        const list = phrases();
        const text = list.length ? fill(template || list[0]) : "";
        const clickable = settings14.store.rotate === "click" && list.length > 1;
        for (const el of targets) {
          const nodes = greetingNodes(el);
          if (!text)
            for (const node of nodes)
              swaps.restore(node);
          else
            nodes.forEach((node, i) => swaps.set(node, i ? "" : text));
          if (clickable !== el.hasAttribute(CLICKABLE))
            el.toggleAttribute(CLICKABLE, clickable);
        }
      };
      const placeholderText = () => {
        const mode = settings14.store.input;
        if (mode === "off" || mode === "project" && !isProjectPage(location.pathname))
          return "";
        return settings14.store.placeholder.trim() || fill(phrases()[0] ?? "");
      };
      let lastCss = "";
      const placeholderSwaps = new TextSwaps;
      const paintPlaceholders = () => {
        const text = placeholderText();
        placeholderSwaps.prune();
        for (const el of document.querySelectorAll(SEL.composerPlaceholder)) {
          const nodes = textNodes(el);
          if (!text)
            for (const node of nodes)
              placeholderSwaps.restore(node);
          else
            nodes.forEach((node, i) => placeholderSwaps.set(node, i ? "" : text));
        }
        const css = placeholderCss(text);
        if (css === lastCss)
          return;
        lastCss = css;
        setPlaceholderCss(css);
      };
      const paint = () => {
        paintGreeting();
        paintPlaceholders();
      };
      let timer = null;
      const observer = new MutationObserver(() => timer ??= setTimeout(() => {
        timer = null;
        if (scope.alive)
          paint();
      }, 60));
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
      scope.defer(() => {
        observer.disconnect();
        if (timer)
          clearTimeout(timer);
        swaps.restore();
        placeholderSwaps.restore();
        for (const el of document.querySelectorAll(`[${CLICKABLE}]`))
          el.removeAttribute(CLICKABLE);
      });
      scope.listen(document, "click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const home = target?.closest("a[href]");
        if (home && ["/", "/new"].includes(home.getAttribute("href")) && ["/", "/new"].includes(location.pathname)) {
          shown = false;
          setTimeout(() => scope.alive && paint(), 120);
          return;
        }
        if (settings14.store.rotate !== "click" || phrases().length < 2)
          return;
        if (!target || !findGreetings().some((el) => el.contains(target)))
          return;
        if (String(window.getSelection?.() ?? "").trim())
          return;
        next();
        paint();
      });
      if (settings14.store.rotate === "timer")
        scope.interval(() => {
          if (!shown)
            return;
          next();
          paint();
        }, settings14.store.intervalSec * 1000);
      onRoute(scope, () => {
        shown = false;
        paintPlaceholders();
      }, false);
      paint();
    }
  });

  // src/plugins/cleaner/index.ts
  var settings15 = definePluginSettings({
    upgrade: { type: "boolean", label: { zh: "隐藏升级 / 购买入口", en: "Hide upgrade and buy prompts" }, default: true },
    plan: { type: "boolean", label: { zh: "隐藏头像旁的套餐名", en: "Hide the plan name next to your name" }, default: false },
    codeNudge: { type: "boolean", label: { zh: "隐藏输入框里的 Claude Code 推广提示", en: "Hide the Claude Code nudge in the input" }, default: true },
    templates: { type: "boolean", label: { zh: "隐藏侧栏「从模板新建」按钮", en: "Hide the sidebar “New from a template” button" }, default: false }
  });
  var UPGRADE_RE = /^(upgrade|upgrade plan|upgrade to (pro|max)|get (pro|max)|try (pro|max)|升级|升级套餐)$/i;
  function cleanerCss(options) {
    return [
      `[data-ccpp-cleaned] { display: none !important; }`,
      `a[href^="/upgrade"], a[href*="/upgrade?"] { display: none !important; }`,
      options.plan ? `[data-testid="user-menu-button"] .df-footer-suffix-text { display: none !important; }` : "",
      options.codeNudge ? `#claude-code-nudge-body, [id^="claude-code-nudge"] { display: none !important; }` : "",
      options.templates ? `button[aria-label="New from a template"] { display: none !important; }` : ""
    ].join(`
`);
  }
  var cleaner_default = definePlugin({
    name: "Cleaner",
    title: { zh: "界面清理", en: "Cleaner" },
    description: { zh: "隐藏升级推销、套餐标签、Claude Code 推广提示等干扰元素（各项可分别开关）。", en: "Hides upgrade nags, the plan label, the Claude Code nudge and similar clutter (each switchable)." },
    category: "declutter",
    icon: "brush",
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings: settings15,
    start(scope) {
      addStyle(scope, cleanerCss(settings15.store), "cleaner");
      if (settings15.store.upgrade) {
        onDomChange(scope, () => {
          for (const el of document.querySelectorAll("a, button")) {
            if (el.dataset.ccppCleaned !== undefined || el.closest("[data-ccpp]"))
              continue;
            if (UPGRADE_RE.test(el.textContent?.trim() ?? ""))
              el.dataset.ccppCleaned = "";
          }
        });
        scope.defer(() => document.querySelectorAll("[data-ccpp-cleaned]").forEach((el) => el.removeAttribute("data-ccpp-cleaned")));
      }
    }
  });

  // src/plugins/noShareLink/index.ts
  var noShareLink_default = definePlugin({
    name: "NoShareLink",
    title: { zh: "隐藏分享按钮", en: "No share button" },
    description: { zh: "隐藏对话右上角的「分享」按钮，避免误点生成公开链接。", en: "Hides the Share button at the top right of chats so you never create a public link by accident." },
    category: "declutter",
    tags: ["privacy"],
    icon: "linkOff",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    start(scope) {
      addStyle(scope, `[data-testid="wiggle-controls-actions-share"] { display: none !important; }`, "no-share");
    }
  });

  // src/plugins/noDictation/index.ts
  var settings16 = definePluginSettings({
    dictation: { type: "boolean", label: { zh: "隐藏听写按钮", en: "Hide dictation" }, default: true },
    voice: { type: "boolean", label: { zh: "隐藏语音模式按钮", en: "Hide voice mode" }, default: true },
    readAloud: { type: "boolean", label: { zh: "隐藏回复下方的「朗读」按钮", en: "Hide Read aloud under replies" }, default: false }
  });
  function noDictationCss(dictation, voice, readAloud = false) {
    const selectors = [
      ...dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]', 'button[aria-label="Dictation settings"]', 'button[aria-label^="Dictation" i]', 'button[aria-label*="dictat" i]'] : [],
      ...voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]', 'button[aria-label*="voice mode" i]'] : [],
      ...readAloud ? ['[data-testid="action-bar-read-aloud"]', 'button[aria-label="Read aloud"]'] : []
    ];
    return selectors.length ? `${selectors.join(`,
`)} { display: none !important; }` : "";
  }
  var noDictation_default = definePlugin({
    name: "NoDictation",
    title: { zh: "隐藏语音按钮", en: "No voice buttons" },
    description: { zh: "隐藏输入框里的听写 / 语音模式按钮、听写设置（按住录音）入口，以及回复下方的「朗读」按钮，普通对话和 Claude Code 都适用。", en: "Hides the dictation and voice-mode buttons, the dictation settings (hold to record) menu and Read aloud under replies, in chats and Claude Code." },
    category: "declutter",
    icon: "micOff",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    settings: settings16,
    start(scope) {
      addStyle(scope, noDictationCss(settings16.store.dictation, settings16.store.voice, settings16.store.readAloud), "no-dictation");
    }
  });

  // src/plugins/streamerMode/index.ts
  var settings17 = definePluginSettings({
    identity: { type: "boolean", label: { zh: "模糊你的名字、头像、套餐与设备名", en: "Blur your name, avatar, plan and device name" }, default: true },
    sidebar: { type: "boolean", label: { zh: "模糊侧栏的对话 / 项目标题", en: "Blur chat and project titles in the sidebar" }, default: true },
    title: { type: "boolean", label: { zh: "模糊当前对话 / 项目标题", en: "Blur the current chat or project title" }, default: false },
    hover: { type: "boolean", label: { zh: "悬停时显示", en: "Reveal on hover" }, default: true },
    amount: { type: "number", label: { zh: "模糊程度", en: "Blur amount" }, default: 6, min: 2, max: 16, unit: "px" }
  });
  function streamerCss(o) {
    const targets = [
      ...o.identity ? ['[data-testid="user-menu-button"] .df-user-menu-trailing', '[data-testid="user-menu-button"] [data-cds="Avatar"]', "[data-new-page-greeting-text]", '[data-testid="cowork-computer-link-indicator"]'] : [],
      ...o.sidebar ? ['[data-testid="sidebar"] [data-row-label]', '[data-testid="sidebar"] a[href^="/chat/"]'] : [],
      ...o.title ? ['[data-testid="session-title-split"]', "[data-pane-title]", '[data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]'] : []
    ];
    if (!targets.length)
      return "";
    const list = targets.join(`,
`);
    const reveal = o.hover ? `
${targets.map((t) => `${t}:hover`).join(`,
`)} { filter: none !important; }` : "";
    return `${list} { filter: blur(${o.amount}px) !important; transition: filter .15s; }${reveal}`;
  }
  var streamerMode_default = definePlugin({
    name: "StreamerMode",
    title: { zh: "直播 / 截图模式", en: "Streamer mode" },
    description: { zh: "模糊你的名字、头像、套餐与侧栏标题，录屏或截图时不泄露隐私；悬停可临时查看。", en: "Blurs your name, avatar, plan and sidebar titles for screen sharing; hover to peek." },
    category: "privacy",
    icon: "eyeOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings: settings17,
    start(scope) {
      const set = addStyle(scope, streamerCss(settings17.store), "streamer");
      this.onSettingsChange = () => set(streamerCss(settings17.store));
    }
  });

  // src/plugins/recentChats/index.ts
  var settings18 = definePluginSettings({
    hotkey: { type: "string", label: { zh: "快捷键", en: "Shortcut" }, default: "ctrl+`" },
    count: { type: "number", label: { zh: "显示几个最近对话", en: "Chats to show" }, default: 9, min: 3, max: 24 }
  });
  var L17 = {
    title: { zh: "最近打开的对话", en: "Recently opened chats" },
    empty: { zh: "还没有记录。打开过的对话会出现在这里。", en: "Nothing yet. Chats you open show up here." },
    hint: { zh: "↑↓←→ 选择 · Enter 打开 · 1–9 直达 · Esc 关闭", en: "Arrows to pick · Enter to open · 1–9 to jump · Esc to close" }
  };
  var visits = persisted("recent-chats", [], (v) => Array.isArray(v) && v.every((x) => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.at === "number"));
  function recordVisit(list, visit, max = 50) {
    const previous = list.find((v) => v.id === visit.id);
    const title = visit.title || previous?.title || "";
    return [{ ...visit, title }, ...list.filter((v) => v.id !== visit.id)].slice(0, max);
  }
  function renameVisit(list, id, title) {
    if (!title)
      return list;
    const index = list.findIndex((v) => v.id === id);
    if (index < 0 || list[index].title === title)
      return list;
    const next = [...list];
    next[index] = { ...next[index], title };
    return next;
  }
  var CSS8 = `
.overlay { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: auto; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; } }
.box { width: min(860px, calc(100vw - 32px)); padding: 16px; border-radius: 18px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--line); box-shadow: var(--shadow); }
.box h3 { margin: 0 0 12px; font-size: 14px; display: flex; justify-content: space-between; } .box h3 span { font-weight: 400; color: var(--fg3); font-size: 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.card { position: relative; display: flex; flex-direction: column; gap: 6px; min-height: 76px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); text-align: left; }
.card:hover, .card.sel { border-color: var(--accent); background: var(--bg); }
.card .n { position: absolute; top: 8px; right: 10px; font-size: 11px; color: var(--fg3); }
.card .t { font-weight: 600; padding-right: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card .s { color: var(--fg3); font-size: 12px; margin-top: auto; }
.card.cur .s::after { content: " · ●"; color: var(--accent); }
.empty { padding: 24px; text-align: center; color: var(--fg3); }
`;
  var recentChats_default = definePlugin({
    name: "RecentChats",
    title: { zh: "最近对话切换", en: "Recent chats switcher" },
    description: { zh: "按 Ctrl+` 弹出最近打开过的对话卡片，方向键 / 数字键快速切换。", en: "Press Ctrl+` for cards of recently opened chats; switch with arrows or number keys." },
    category: "navigation",
    icon: "grid",
    enabledByDefault: true,
    dependencies: ["RouterApi", "HotkeysApi", "ChatStateApi"],
    settings: settings18,
    start(scope) {
      onRoute(scope, (route) => {
        if (!route.chatId)
          return;
        const id = route.chatId;
        scope.timeout(() => {
          if (currentRoute().chatId !== id)
            return;
          visits.set(recordVisit(visits.get(), { id, title: chatTitle(), at: Date.now() }));
        }, 1500);
      });
      scope.interval(() => {
        const id = currentRoute().chatId;
        if (!id)
          return;
        const list = visits.get();
        const next = renameVisit(list, id, chatTitle());
        if (next !== list)
          visits.set(next);
      }, 3000);
      const { box } = createHost(scope, "recent-chats", CSS8, { layer: "page" });
      let selected = 0;
      let open = false;
      const close = () => {
        open = false;
        clear(box);
      };
      const go = (visit) => {
        close();
        if (!visit || visit.id === currentRoute().chatId)
          return;
        const link = document.querySelector(`a[href="/chat/${visit.id}"]`);
        if (link)
          link.click();
        else
          location.assign(`/chat/${visit.id}`);
      };
      const render = () => {
        clear(box);
        const list = visits.get().slice(0, settings18.store.count);
        const cards = h("div", { class: "cards" });
        list.forEach((visit, i) => {
          const card = h("button", { type: "button", class: `card${i === selected ? " sel" : ""}${visit.id === currentRoute().chatId ? " cur" : ""}` }, i < 9 ? h("span", { class: "n", text: String(i + 1) }) : null, h("span", { class: "t", text: visit.title || visit.id.slice(0, 8) }), h("span", { class: "s", text: agoText(visit.at) }));
          card.addEventListener("click", () => go(visit));
          cards.appendChild(card);
        });
        const overlay = h("div", { class: "overlay", role: "dialog", "aria-label": t(L17.title) }, h("div", { class: "box" }, h("h3", {}, t(L17.title), h("span", { text: t(L17.hint) })), list.length ? cards : h("div", { class: "empty", text: t(L17.empty) })));
        overlay.addEventListener("mousedown", (event) => event.target === overlay && close());
        box.appendChild(overlay);
      };
      const toggle = () => {
        if (open)
          return close();
        open = true;
        selected = visits.get()[0]?.id === currentRoute().chatId ? 1 : 0;
        render();
      };
      if (settings18.store.hotkey.trim())
        bindKey(scope, settings18.store.hotkey, toggle, { inInputs: true });
      scope.listen(window, "keydown", (event) => {
        if (!open)
          return;
        const list = visits.get().slice(0, settings18.store.count);
        const cols = Math.max(1, Math.floor((box.querySelector(".cards")?.clientWidth ?? 720) / 250));
        const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Tab: event.shiftKey ? -1 : 1 };
        if (event.key in moves)
          selected = (selected + moves[event.key] + list.length) % Math.max(1, list.length);
        else if (event.key === "Enter")
          go(list[selected]);
        else if (event.key === "Escape")
          close();
        else if (/^[1-9]$/.test(event.key))
          go(list[Number(event.key) - 1]);
        else
          return;
        event.preventDefault();
        event.stopPropagation();
        if (open)
          render();
      }, { capture: true });
    }
  });

  // src/plugins/exportChat/index.ts
  var settings19 = definePluginSettings({
    timestamps: { type: "boolean", label: { zh: "Markdown 里包含时间", en: "Include times in Markdown" }, default: true }
  });
  var L18 = {
    title: { zh: "导出对话", en: "Export chat" },
    md: { zh: "Markdown (.md)", en: "Markdown (.md)" },
    txt: { zh: "纯文本 (.txt)", en: "Plain text (.txt)" },
    json: { zh: "JSON (.json)", en: "JSON (.json)" },
    copy: { zh: "复制为 Markdown", en: "Copy as Markdown" },
    copied: { zh: "已复制到剪贴板", en: "Copied to the clipboard" },
    failed: { zh: "导出失败：{e}", en: "Export failed: {e}" },
    note: { zh: "导出当前显示的分支，内容来自 claude.ai 接口。", en: "Exports the branch on screen, read from claude.ai's API." }
  };
  var stamp = (at) => at ? fullDateText(at) : "";
  function toMarkdown(chat, timestamps) {
    const head = [`# ${chat.name || "Claude chat"}`, "", `- URL: https://claude.ai/chat/${chat.uuid}`, chat.model ? `- Model: ${chat.model}` : "", chat.createdAt ? `- Created: ${stamp(chat.createdAt)}` : ""].filter((line) => line !== "");
    const body = chat.messages.map((m) => {
      const who = m.role === "user" ? "## \uD83E\uDDD1 You" : "## \uD83E\uDD16 Claude";
      return `${who}${timestamps && m.createdAt ? ` · ${stamp(m.createdAt)}` : ""}

${m.text.trim()}`;
    });
    return `${head.join(`
`)}

${body.join(`

---

`)}
`;
  }
  function toText(chat) {
    return `${chat.name}

${chat.messages.map((m) => `[${m.role === "user" ? "You" : "Claude"}]
${m.text.trim()}`).join(`

`)}
`;
  }
  var exportChat_default = definePlugin({
    name: "ExportChat",
    title: L18.title,
    description: { zh: "对话标题栏加一个导出按钮：下载 Markdown / 纯文本 / JSON，或复制为 Markdown。", en: "An export button in the chat header: download Markdown, text or JSON, or copy as Markdown." },
    category: "chats",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "SlotsApi", "NoticesApi", "RouterApi"],
    settings: settings19,
    start(scope) {
      const popover = createPopover(scope, "export", "", 240);
      const run = async (format) => {
        popover.close();
        try {
          const chat = await loadConversation(currentRoute().chatId, true);
          if (!chat)
            return;
          const name = fileSafe(chat.name || chat.uuid);
          if (format === "json")
            download(`${name}.json`, JSON.stringify(chat, null, 2), "application/json");
          else if (format === "txt")
            download(`${name}.txt`, toText(chat));
          else {
            const md = toMarkdown(chat, settings19.store.timestamps);
            if (format === "md")
              download(`${name}.md`, md, "text/markdown");
            else {
              await navigator.clipboard.writeText(md);
              toast(t(L18.copied), { kind: "ok", timeoutMs: 2500 });
            }
          }
        } catch (error) {
          toast(t(L18.failed).replace("{e}", error.message || String(error)), { kind: "error" });
        }
      };
      addSlotItem(scope, "header", "export", () => {
        const btn = slotButton(t(L18.title), (event) => popover.open(event.currentTarget, (panel) => {
          panel.appendChild(h("div", { class: "top" }, icon("download", 16), h("b", { text: t(L18.title) })));
          for (const [format, label] of [["md", L18.md], ["txt", L18.txt], ["json", L18.json], ["copy", L18.copy]]) {
            const item = h("button", { type: "button", class: "item", text: t(label) });
            item.addEventListener("click", () => void run(format));
            panel.appendChild(item);
          }
          panel.appendChild(h("div", { class: "msg", text: t(L18.note), style: { fontSize: "12px" } }));
        }), icon("download", 16));
        btn.hidden = !currentRoute().chatId;
        return btn;
      }, 20);
    }
  });

  // src/plugins/messageTimestamps/index.ts
  var settings20 = definePluginSettings({
    always: { type: "boolean", label: { zh: "始终显示时间（不用悬停）", en: "Always show the time (no hover needed)" }, default: true },
    absolute: { type: "boolean", label: { zh: "显示具体时间而不是「x 分钟前」", en: "Show the exact time instead of “x minutes ago”" }, default: true }
  });
  var messageTimestamps_default = definePlugin({
    name: "MessageTimestamps",
    title: { zh: "消息时间", en: "Message timestamps" },
    description: { zh: "让回复操作栏里的时间始终可见，并显示为具体时间（今天只显示时:分），悬停看完整日期。", en: "Keeps the time in the reply action bar visible and shows the exact time (just hh:mm today), full date on hover." },
    category: "messages",
    icon: "clock",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings20,
    start(scope) {
      if (settings20.store.always)
        addStyle(scope, `${SEL.messageActions} ${SEL.messageTime} { opacity: 1 !important; visibility: visible !important; }`, "timestamps");
      if (!settings20.store.absolute)
        return;
      watch(scope, `${SEL.messageActions} ${SEL.messageTime}`, (el) => {
        const paint = () => {
          const at = Date.parse(el.getAttribute("datetime") ?? "");
          if (!Number.isFinite(at))
            return;
          const text = dateTimeText(at);
          if (el.textContent !== text)
            el.textContent = text;
          el.setAttribute("data-ccpp-tip", fullDateText(at));
        };
        paint();
        const observer = new MutationObserver(paint);
        observer.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["datetime"] });
        return () => observer.disconnect();
      });
    }
  });

  // src/plugins/collapseCode/index.ts
  var settings21 = definePluginSettings({
    lines: { type: "number", label: { zh: "超过多少行折叠（行）", en: "Collapse code longer than (lines)" }, default: 30, min: 8, max: 200, step: 2 }
  });
  var L19 = { expand: { zh: "展开全部代码（{n} 行）", en: "Show all {n} lines" }, collapse: { zh: "收起代码", en: "Collapse code" } };
  var CSS9 = `
.ccpp-code-collapsed { max-height: var(--ccpp-code-max, 30lh) !important; overflow: hidden !important; -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
.ccpp-code-toggle { display: block; margin: 4px auto 8px; padding: 2px 12px; border-radius: 999px; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; font: 12px/20px ui-sans-serif, system-ui, sans-serif; opacity: .8; cursor: pointer; }
.ccpp-code-toggle:hover { opacity: 1; }
`;
  var collapseCode_default = definePlugin({
    name: "CollapseCode",
    title: { zh: "折叠长代码", en: "Collapse long code" },
    description: { zh: "回复完成后把很长的代码块折叠成固定高度，点按钮展开 / 收起。", en: "After a reply finishes, folds very long code blocks to a fixed height with a show/hide button." },
    category: "messages",
    icon: "collapse",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings: settings21,
    start(scope) {
      addStyle(scope, CSS9, "collapse-code");
      const max = settings21.store.lines;
      watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] pre`, (pre) => {
        const lines = (pre.textContent ?? "").split(`
`).length;
        if (lines <= max)
          return;
        pre.style.setProperty("--ccpp-code-max", `${max}lh`);
        pre.classList.add("ccpp-code-collapsed");
        const button = h("button", { type: "button", class: "ccpp-code-toggle", text: t(L19.expand).replace("{n}", String(lines)) });
        button.addEventListener("click", () => {
          const collapsed = pre.classList.toggle("ccpp-code-collapsed");
          button.textContent = collapsed ? t(L19.expand).replace("{n}", String(lines)) : t(L19.collapse);
        });
        pre.after(button);
        return () => {
          pre.classList.remove("ccpp-code-collapsed");
          button.remove();
        };
      });
    }
  });

  // src/plugins/betterLinks/index.ts
  var DOMAIN_RE = /(?<![@\w./-])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|ai|app|edu|gov|co|cn|me|info|xyz|so|sh|gg|tv|uk|de|jp)(?:\/[^\s<>()"'，。、）]*)?)(?![\w@-])/gi;
  function splitLinks(text) {
    const out = [];
    let last = 0;
    DOMAIN_RE.lastIndex = 0;
    for (let m = DOMAIN_RE.exec(text);m; m = DOMAIN_RE.exec(text)) {
      let value = m[1];
      const trail = /[.,;:!?]+$/.exec(value)?.[0] ?? "";
      value = value.slice(0, value.length - trail.length);
      if (m.index > last)
        out.push(text.slice(last, m.index));
      out.push({ href: /^https?:\/\//i.test(value) ? value : `https://${value}`, text: value });
      last = m.index + value.length;
    }
    if (last < text.length)
      out.push(text.slice(last));
    return out;
  }
  var HAS_DOMAIN = new RegExp(DOMAIN_RE.source, "i");
  var SKIP = "a, code, pre, button, [contenteditable], .katex";
  var betterLinks_default = definePlugin({
    name: "BetterLinks",
    title: { zh: "裸域名可点击", en: "Clickable bare domains" },
    description: { zh: "把回复里没有加链接的域名（如 example.com/docs）变成可点击的链接，只处理已完成的回复。", en: "Turns bare domains in finished replies (like example.com/docs) into links." },
    category: "messages",
    icon: "link",
    enabledByDefault: false,
    dependencies: ["DomApi"],
    start(scope) {
      watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] ${SEL.prose}`, (prose) => {
        const added = [];
        const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => node.parentElement?.closest(SKIP) || !HAS_DOMAIN.test(node.nodeValue ?? "") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        const nodes = [];
        for (let n = walker.nextNode();n; n = walker.nextNode())
          nodes.push(n);
        for (const node of nodes) {
          const parts = splitLinks(node.nodeValue ?? "");
          if (parts.length < 2)
            continue;
          const frag = document.createDocumentFragment();
          for (const part of parts) {
            if (typeof part === "string")
              frag.append(part);
            else {
              const a = h("a", { href: part.href, target: "_blank", rel: "noopener noreferrer", text: part.text, "data-ccpp-link": "" });
              added.push(a);
              frag.append(a);
            }
          }
          node.replaceWith(frag);
        }
        return () => {
          for (const a of added)
            if (a.isConnected)
              a.replaceWith(a.textContent ?? "");
        };
      });
    }
  });

  // src/plugins/noTelemetry/index.ts
  var logger11 = new Logger("NoTelemetry");
  var HOSTS = /(^|\.)(sentry\.io|segment\.(io|com)|statsig(api)?\.(com|net)|featuregates\.org|intercom\.io|datadoghq\.(com|eu)|browser-intake-[a-z0-9-]+\.datadoghq\.(com|eu)|honeycomb\.io|googletagmanager\.com|google-analytics\.com)$/i;
  var PATHS = /^\/(api\/event_logging|api\/(v\d\/)?(track|telemetry|metrics)|sentry|_\/(rum|logs))\b/i;
  function isTelemetry(req) {
    if (HOSTS.test(req.url.hostname))
      return true;
    return req.url.origin === location.origin && PATHS.test(req.url.pathname);
  }
  var noTelemetry_default = definePlugin({
    name: "NoTelemetry",
    title: { zh: "屏蔽遥测", en: "No telemetry" },
    description: { zh: "拦截发往分析 / 错误上报服务的请求（Sentry、Segment、Statsig、Datadog 等）。可能影响官方排障，默认关闭。", en: "Blocks requests to analytics and error-reporting services (Sentry, Segment, Statsig, Datadog…). Off by default." },
    category: "privacy",
    icon: "shield",
    enabledByDefault: false,
    restartNeeded: true,
    startAt: "document-start",
    dependencies: ["NetworkApi"],
    start(scope) {
      let blocked = 0;
      block(scope, (req) => {
        const hit = isTelemetry(req);
        if (hit && ++blocked % 50 === 1)
          logger11.debug(`Blocked ${blocked} telemetry requests so far`);
        return hit;
      });
    }
  });

  // src/plugins/consoleJanitor/index.ts
  var settings22 = definePluginSettings({
    levels: {
      type: "select",
      label: { zh: "静音哪些输出", en: "Silence" },
      default: "info",
      options: [
        { value: "info", label: { zh: "log / info / debug", en: "log / info / debug" } },
        { value: "warn", label: { zh: "以上 + warn", en: "Those + warn" } }
      ]
    }
  });
  var consoleJanitor_default = definePlugin({
    name: "ConsoleJanitor",
    title: { zh: "控制台清净", en: "Console janitor" },
    description: { zh: "静音 claude.ai 在浏览器控制台里的大量日志，只保留错误和 CC++ 自己的输出，方便调试。", en: "Silences claude.ai's console noise, keeping errors and CC++'s own output." },
    category: "developer",
    icon: "terminal",
    enabledByDefault: false,
    startAt: "document-start",
    settings: settings22,
    start(scope) {
      const target = pageWindow.console;
      const levels = settings22.store.levels === "warn" ? ["log", "info", "debug", "warn"] : ["log", "info", "debug"];
      for (const level of levels) {
        const original = target[level];
        const quiet = function(...args) {
          if (typeof args[0] === "string" && args[0].includes(Logger.TAG))
            original.apply(this, args);
        };
        target[level] = quiet;
        scope.defer(() => {
          if (target[level] === quiet)
            target[level] = original;
        });
      }
    }
  });

  // src/plugins/sidebarDefaultCode/index.ts
  var GIVE_UP_MS = 15000;
  var decided = false;
  var settings23 = definePluginSettings({
    onlyCodePages: {
      type: "boolean",
      label: { zh: "只在 claude.ai/code 开头的页面切换", en: "Only on claude.ai/code pages" },
      description: {
        zh: "打开后，只有网址以 https://claude.ai/code 开头时才切到 Code，首页和对话页保持原样。",
        en: "When on, the switch moves to Code only on pages whose address starts with https://claude.ai/code; the home page and chats are left alone."
      },
      default: false
    }
  });
  var isCodePage = () => location.pathname === "/code" || location.pathname.startsWith("/code/");
  var allowedHere = () => settings23.store.onlyCodePages ? isCodePage() : currentRoute().kind === "new";
  var hasDraft = () => !!document.querySelector(SEL.editor)?.textContent?.trim();
  var sidebarDefaultCode_default = definePlugin({
    name: "SidebarDefaultCode",
    title: { zh: "侧栏默认 Code", en: "Sidebar defaults to Code" },
    description: {
      zh: "打开 claude.ai 首页时，侧栏顶部的 Chat / Code 切换自动停在 Code（Claude Code）。只在页面加载时切一次，之后手动切回 Chat 不受影响；打开具体对话链接时不切。可改为只在 claude.ai/code 开头的页面切换。",
      en: "When claude.ai opens on the home page, the Chat / Code switch at the top of the sidebar starts on Code (Claude Code). It switches once per page load, never after you pick Chat yourself, and never when you open a specific chat. Can be limited to claude.ai/code pages."
    },
    category: "navigation",
    icon: "terminal",
    enabledByDefault: true,
    updatedAt: "2026-10-18",
    dependencies: ["DomApi", "RouterApi"],
    settings: settings23,
    start(scope) {
      if (decided)
        return;
      const run = scope.child();
      run.timeout(() => {
        decided = true;
        run.dispose();
      }, GIVE_UP_MS);
      watch(run, SEL.modeCode, (code) => {
        if (decided)
          return;
        decided = true;
        queueMicrotask(() => run.dispose());
        if (!allowedHere() || hasDraft())
          return;
        if (code.getAttribute("aria-checked") !== "true")
          code.click();
      });
    }
  });

  // src/plugins/chatNoticeHider/index.ts
  var settings24 = definePluginSettings({
    disclaimer: { type: "boolean", label: { zh: "隐藏底部的 AI 声明（Claude is AI and can make mistakes.）", en: "Hide the AI notice under the input (Claude is AI and can make mistakes.)" }, default: true },
    appPromo: { type: "boolean", label: { zh: "隐藏 App 下载提示（侧栏底部的「Get apps and extensions」按钮等）", en: "Hide app download prompts (the sidebar’s “Get apps and extensions” button and similar)" }, default: true },
    bugReport: { type: "boolean", label: { zh: "隐藏 Claude Code 侧栏右下角的 Bug 反馈按钮", en: "Hide the bug report button at the bottom right of the Claude Code sidebar" }, default: true }
  });
  var APP_PROMO_RE = /^(get the (desktop |mobile )?app|download (the )?(desktop |mobile )?app|download claude( for (mac|windows|desktop))?|get claude for (mac|windows|desktop)|下载(桌面|客户端|应用|App)|获取(桌面版|应用|App))/i;
  function chatNoticeCss(options) {
    return [
      options.disclaimer ? `[data-disclaimer="true"] { display: none !important; }` : "",
      options.appPromo ? `[data-ccpp-app-promo], a[href="/downloads"][data-cds-icon-only], a[aria-label="Get apps and extensions"] { display: none !important; }` : "",
      options.bugReport ? `[data-testid="code-sidebar-feedback-button"] { display: none !important; }` : ""
    ].join(`
`);
  }
  var chatNoticeHider_default = definePlugin({
    name: "ChatNoticeHider",
    title: { zh: "隐藏 AI 声明与 App 提示", en: "Hide AI notice and app prompt" },
    description: {
      zh: "在聊天页隐藏输入框下方的 AI 声明，侧栏底部的 App 下载按钮，以及 Claude Code 侧栏右下角的 Bug 反馈按钮（各项可分别开关）。",
      en: "On chat pages, hides the AI notice under the input the app download button at the bottom of the sidebar, and the bug report button in the Claude Code sidebar (each switchable)."
    },
    category: "declutter",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings24,
    start(scope) {
      addStyle(scope, chatNoticeCss(settings24.store), "chat-notices");
      if (!settings24.store.appPromo)
        return;
      onDomChange(scope, () => {
        for (const el of document.querySelectorAll('a, button, [role="link"]')) {
          if (el.dataset.ccppAppPromo !== undefined || el.closest('[data-ccpp], [role="menu"], nav'))
            continue;
          if (APP_PROMO_RE.test(el.textContent?.trim() ?? ""))
            el.dataset.ccppAppPromo = "";
        }
      });
      scope.defer(() => document.querySelectorAll("[data-ccpp-app-promo]").forEach((el) => el.removeAttribute("data-ccpp-app-promo")));
    }
  });

  // src/plugins/runningPill/index.ts
  var RUNNING_PILL = '[aria-busy="true"].rounded-full:has(> [data-cds="Spinner"])';
  var BRAND = "var(--cds-fill-brand, #c6613f)";
  var CSS10 = `
${RUNNING_PILL} {
    color: ${BRAND} !important;
    border-color: color-mix(in srgb, ${BRAND} 55%, transparent) !important;
    background-color: color-mix(in srgb, ${BRAND} 14%, var(--cds-surface-1, transparent)) !important;
    font-weight: 500;
}
`;
  var runningPill_default = definePlugin({
    name: "RunningPill",
    title: { zh: "高亮运行中的进度", en: "Highlight running progress" },
    description: {
      zh: "项目页里正在运行的线程，右侧的进度标记（转圈 + 1/6 这样的计数）改用 Claude 的橙色主题色，一眼看出哪些在跑。",
      en: "On project pages, the progress pill (spinner plus a count like 1/6) of a running thread uses Claude's orange brand color, so running work stands out."
    },
    category: "appearance",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-18",
    dependencies: ["StylesApi"],
    start(scope) {
      addStyle(scope, CSS10, "running-pill");
    }
  });

  // src/plugins/customIdentity/index.ts
  var settings25 = definePluginSettings({
    displayName: {
      type: "string",
      label: { zh: "显示名", en: "Display name" },
      description: { zh: "留空保持官方名字。", en: "Empty keeps your real name." },
      placeholder: { zh: "留空保持官方名字", en: "Empty keeps your real name" },
      default: "",
      maxLength: 80
    },
    avatar: {
      type: "image",
      label: { zh: "头像", en: "Avatar" },
      description: { zh: "链接、粘贴、拖入或选择图片；拖动圆圈裁切。", en: "URL, paste, drop or choose; drag to crop." },
      default: "",
      size: 256
    },
    avatarSize: {
      type: "number",
      label: { zh: "侧栏头像大小", en: "Sidebar avatar size" },
      description: { zh: "官方 20px", en: "Official: 20px" },
      default: 24,
      min: 16,
      max: 48,
      unit: "px"
    },
    greeting: {
      type: "boolean",
      label: { zh: "首页问候语也用这个名字", en: "Use the name in the home greeting too" },
      default: true,
      visible: (v) => !!String(v.displayName ?? "").trim()
    },
    applyToMenu: {
      type: "boolean",
      label: { zh: "账号菜单里也替换", en: "Also replace in the account menu" },
      default: true
    }
  });
  var ME = "data-ccpp-me";
  function initials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length)
      return "";
    const first = (w) => Array.from(w)[0] ?? "";
    return (words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0])).toUpperCase();
  }
  var cssUrl = (url) => `url("${url.replace(/["\\\n\r]/g, (c) => `\\${c.charCodeAt(0).toString(16)} `)}")`;
  function avatarCss(url, menu) {
    if (!url)
      return "";
    const targets = [`${SEL.userMenuButton} ${SEL.avatar}`, `${SEL.avatar}[${ME}]`, ...menu ? [`${SEL.accountMenu} ${SEL.avatar}`] : []];
    const list = targets.join(`,
`);
    return `${list} { background: center / cover no-repeat ${cssUrl(url)} !important; border-radius: 9999px !important; color: transparent !important; }
${targets.map((t) => `${t} > *`).join(`,
`)} { opacity: 0 !important; }`;
  }
  var SIZED = "data-ccpp-avatar-size";
  function sizeCss(px) {
    const button = `${SEL.userMenuButton}[${SIZED}]`;
    const size = `${px}px`;
    return `${button} ${SEL.avatar} { width: ${size} !important; height: ${size} !important; min-width: ${size} !important; min-height: ${size} !important; margin-block: calc((20px - ${size}) / 2) !important; font-size: calc(${size} * .45) !important; }
${button} :has(> ${SEL.avatar}) { width: max(var(--df-leading-slot, 28px), ${size}) !important; flex-shrink: 0 !important; }`;
  }
  function swapName(text, real, name, whole) {
    if (!real || !name || real === name)
      return text;
    if (whole)
      return text.trim() === real ? text.replace(real, name) : text;
    return text.includes(real) ? text.replaceAll(real, name) : text;
  }
  var customIdentity_default = definePlugin({
    name: "CustomIdentity",
    title: { zh: "自定义头像与用户名", en: "Custom avatar & name" },
    description: { zh: "替换侧栏和账号菜单里的头像与显示名，只改你看到的样子，不改账号资料。留空的项保持官方值。", en: "Replaces the avatar and display name in the sidebar and account menu, only on your screen; your account is unchanged. Empty fields keep the official values." },
    category: "appearance",
    tags: ["privacy"],
    icon: "user",
    enabledByDefault: false,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings25,
    start(scope) {
      const swaps = new TextSwaps;
      const setCss = addStyle(scope, "", "custom-identity");
      let lastUrl = null;
      const setSizeCss = addStyle(scope, sizeCss(settings25.store.avatarSize), "custom-identity-size");
      const paint = () => {
        const { displayName, avatar, applyToMenu, greeting } = settings25.store;
        const name = displayName.trim();
        const url = avatar.trim();
        if (url !== lastUrl) {
          lastUrl = url;
          setCss(avatarCss(url, applyToMenu));
        }
        const real = realName();
        swaps.prune();
        for (const button of document.querySelectorAll(SEL.userMenuButton)) {
          const name = button.querySelector(".df-user-menu-trailing");
          const expanded = !!name && name.offsetWidth > 0;
          if (expanded !== button.hasAttribute(SIZED))
            button.toggleAttribute(SIZED, expanded);
        }
        const roots = identityRoots().filter((root) => applyToMenu || !root.matches(SEL.menu));
        for (const avatarEl of document.querySelectorAll(SEL.avatar)) {
          const inRoot = roots.some((root) => root.contains(avatarEl));
          const label = avatarEl.getAttribute(ORIG_LABEL) ?? avatarEl.getAttribute("aria-label") ?? "";
          const mine = !!real && label.trim() === real;
          if (mine && !inRoot)
            avatarEl.setAttribute(ME, "");
          else
            avatarEl.removeAttribute(ME);
          if ((inRoot || mine) && name) {
            if (!avatarEl.hasAttribute(ORIG_LABEL))
              avatarEl.setAttribute(ORIG_LABEL, label);
            if (avatarEl.getAttribute("aria-label") !== name)
              avatarEl.setAttribute("aria-label", name);
            for (const node of textNodes(avatarEl)) {
              const text = swaps.original(node).trim();
              if (text && text.length <= 3)
                swaps.set(node, initials(name));
            }
          } else if (avatarEl.hasAttribute(ORIG_LABEL)) {
            avatarEl.setAttribute("aria-label", avatarEl.getAttribute(ORIG_LABEL));
            avatarEl.removeAttribute(ORIG_LABEL);
            for (const node of textNodes(avatarEl))
              swaps.restore(node);
          }
        }
        const rename = (root, whole) => {
          for (const node of textNodes(root)) {
            if (node.parentElement?.closest(SEL.avatar))
              continue;
            const original = swaps.original(node);
            const next = swapName(original, real, name, whole);
            if (next !== original)
              swaps.set(node, next);
            else
              swaps.restore(node);
          }
        };
        for (const root of roots)
          rename(root, true);
        if (greeting)
          for (const el of document.querySelectorAll(SEL.greeting))
            rename(el, false);
      };
      repaintOnChange(scope, paint);
      this.onSettingsChange = () => {
        lastUrl = null;
        setSizeCss(sizeCss(settings25.store.avatarSize));
        swaps.restore();
        for (const el of document.querySelectorAll(`[${ME}]`))
          el.removeAttribute(ME);
        paint();
      };
      scope.defer(() => {
        swaps.restore();
        for (const el of document.querySelectorAll(`[${ORIG_LABEL}]`)) {
          el.setAttribute("aria-label", el.getAttribute(ORIG_LABEL));
          el.removeAttribute(ORIG_LABEL);
        }
        for (const el of document.querySelectorAll(`[${ME}]`))
          el.removeAttribute(ME);
        for (const el of document.querySelectorAll(`[${SIZED}]`))
          el.removeAttribute(SIZED);
      });
    }
  });

  // src/plugins/hideIdentity/index.ts
  var settings26 = definePluginSettings({
    hideEmail: {
      type: "boolean",
      label: { zh: "隐藏邮箱", en: "Hide email" },
      default: true
    },
    hideName: {
      type: "boolean",
      label: { zh: "隐藏用户名", en: "Hide username" },
      default: false
    }
  });
  var HIDE = "data-ccpp-hide-identity";
  var EMAIL = /[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}/i;
  var MENU_ROW = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
  var isEmail = (text) => {
    const match = EMAIL.exec(text.trim());
    return !!match && match[0] === text.trim();
  };
  var stripEmail = (text) => text.replace(new RegExp(`\\s*[·•|–—-]?\\s*[(<]?${EMAIL.source}[)>]?`, "gi"), "").replace(/^\s*[·•|–—-]\s*/, "").trimEnd();
  function soleHolder(node, root, text) {
    let el = node.parentElement;
    if (!el || !root.contains(el))
      return null;
    while (el.parentElement && el.parentElement !== root && !el.parentElement.matches(MENU_ROW) && el.parentElement.textContent?.trim() === text)
      el = el.parentElement;
    return el.matches(MENU_ROW) ? null : el;
  }
  var hideIdentity_default = definePlugin({
    name: "HideIdentity",
    title: { zh: "隐藏邮箱 / 用户名", en: "Hide email / username" },
    description: { zh: "隐藏头像弹出的账号菜单里的邮箱（也可隐藏用户名），截图、录屏时不露出账号。", en: "Hides the email (and optionally your name) in the account menu the avatar opens, so screenshots don't show your account." },
    category: "privacy",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings: settings26,
    start(scope) {
      const { hideEmail, hideName } = settings26.store;
      addStyle(scope, `[${HIDE}] { display: none !important; }`, "hide-identity");
      const swaps = new TextSwaps;
      const hidden = new Set;
      const hide = (el) => {
        el.setAttribute(HIDE, "");
        hidden.add(el);
        const next = el.nextElementSibling;
        const first = ![...el.parentElement?.children ?? []].some((c) => c !== el && c.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !c.hasAttribute(HIDE));
        if (first && next?.matches('[role="separator"]')) {
          next.setAttribute(HIDE, "");
          hidden.add(next);
        }
      };
      const paint = () => {
        swaps.prune();
        const shown = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`)?.getAttribute("aria-label")?.trim();
        const names = new Set([realName(), shown].filter((n) => !!n));
        for (const root of identityRoots()) {
          for (const node of textNodes(root)) {
            const text = swaps.original(node).trim();
            if (!text)
              continue;
            if (hideEmail && EMAIL.test(text)) {
              const holder = isEmail(text) ? soleHolder(node, root, node.data.trim()) : null;
              if (holder) {
                if (!holder.hasAttribute(HIDE))
                  hide(holder);
              } else {
                swaps.set(node, stripEmail(swaps.original(node)));
              }
              continue;
            }
            if (hideName && names.has(node.data.trim()) && !node.parentElement?.closest(SEL.avatar)) {
              const holder = soleHolder(node, root, node.data.trim());
              if (holder && !holder.hasAttribute(HIDE))
                hide(holder);
            }
          }
        }
      };
      repaintOnChange(scope, paint);
      scope.defer(() => {
        swaps.restore();
        for (const el of hidden)
          el.removeAttribute(HIDE);
        for (const el of document.querySelectorAll(`[${HIDE}]`))
          el.removeAttribute(HIDE);
      });
    }
  });

  // src/plugins/autoRetry/index.ts
  var settings27 = definePluginSettings({
    maxRetries: { type: "number", label: { zh: "最多连续重试几次", en: "Maximum retries in a row" }, default: 3, min: 1, max: 10 },
    delay: { type: "number", label: { zh: "重试前等待", en: "Wait before retrying" }, default: 2, min: 0, max: 60, unit: "s" }
  });
  var L20 = {
    retrying: { zh: "发送失败，正在重试（{n}/{max}）", en: "Couldn't send, retrying ({n}/{max})" },
    gaveUp: { zh: "已重试 {max} 次仍未发出，请稍后手动发送。", en: "Still not sent after {max} retries. Send it again later." },
    changed: { zh: "输入框内容已改动，没有自动重试。", en: "The message box changed, so it wasn't retried." }
  };
  var norm = (text) => text.replace(/\s+/g, " ").trim();
  var fill4 = (text, n, max) => text.replace("{n}", String(n)).replace(/\{max\}/g, String(max));
  function sendButtonFor(editor) {
    let near = editor;
    while (near && !near.querySelector(SEL.sendButton))
      near = near.parentElement;
    return near?.querySelector(SEL.sendButton) ?? null;
  }
  function resend(editor) {
    const button = sendButtonFor(editor);
    if (button && !button.disabled)
      return button.click();
    editor.focus();
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true, cancelable: true }));
  }
  var autoRetry_default = definePlugin({
    name: "AutoRetry",
    title: { zh: "发送失败自动重试", en: "Auto retry" },
    description: {
      zh: "Claude Code 项目页弹出「Couldn't send the message」时，自动把放回输入框的消息重新发送，可设次数和间隔。",
      en: `When a Claude Code project page says "Couldn't send the message", sends the message claude.ai put back in the box again. Retries and delay are adjustable.`
    },
    category: "chats",
    icon: "refresh",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ChatStateApi", "ComposerApi", "NoticesApi"],
    settings: settings27,
    start(scope) {
      let last = null;
      const counts = new Map;
      let timer;
      scope.defer(() => clearTimeout(timer));
      onSubmit(scope, (text, editor) => {
        last = { text: norm(text), editor };
      });
      scope.on("send:ok", ({ channelId }) => {
        counts.delete(channelId);
      });
      scope.on("send:failed", ({ channelId }) => {
        const sent = last;
        if (!sent?.editor)
          return;
        const max = settings27.store.maxRetries;
        const count = (counts.get(channelId) ?? 0) + 1;
        if (count > max) {
          counts.delete(channelId);
          toast(fill4(t(L20.gaveUp), count, max), { kind: "error", key: "auto-retry", timeoutMs: 8000 });
          return;
        }
        counts.set(channelId, count);
        toast(fill4(t(L20.retrying), count, max), { kind: "warn", key: "auto-retry" });
        clearTimeout(timer);
        timer = setTimeout(() => {
          const editor = sent.editor;
          if (!editor.isConnected || norm(getText(editor)) !== sent.text) {
            counts.delete(channelId);
            toast(t(L20.changed), { kind: "info", key: "auto-retry" });
            return;
          }
          resend(editor);
        }, settings27.store.delay * 1000);
      });
    }
  });

  // src/plugins/codeBrandColor/index.ts
  var CLAUDE_ORANGE = "#c6613f";
  var settings28 = definePluginSettings({
    color: { type: "color", label: { zh: "颜色", en: "Color" }, description: { zh: "默认是 Claude 的橙色。", en: "Defaults to Claude's orange." }, default: CLAUDE_ORANGE }
  });
  var codeBrandCss = (color) => `
[data-app-wordmark="code"] > span { color: ${color} !important; }
`;
  var codeBrandColor_default = definePlugin({
    name: "CodeBrandColor",
    title: { zh: "侧栏 Code 主题色", en: "Colored Code title" },
    description: {
      zh: "Code 模式下，侧栏顶部的「Code」字样改用主题色，默认 Claude 橙色，可自选颜色。",
      en: `In Code mode, the "Code" title at the top of the sidebar uses a theme color, Claude's orange by default.`
    },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["StylesApi"],
    settings: settings28,
    start(scope) {
      const color = () => /^#[0-9a-f]{6}$/i.test(settings28.store.color) ? settings28.store.color : CLAUDE_ORANGE;
      const css = () => codeBrandCss(color());
      const set = addStyle(scope, css(), "code-brand-color");
      this.onSettingsChange = () => set(css());
    }
  });

  // src/plugins/index.ts
  var PLUGINS = [
    dom_default,
    styles_default,
    router_default,
    network_default,
    claude_default,
    chatState_default,
    notices_default,
    slots_default,
    composer_default,
    transcript_default,
    hotkeys_default,
    menu_default,
    settings_default,
    themes_default,
    quickCss_default,
    backup_default,
    usageDisplay_default,
    chatNavigator_default,
    messageStars_default,
    projectStatus_default,
    inputHistory_default,
    promptPresets_default,
    replyNotification_default,
    chatFavicon_default,
    widerChat_default,
    composerLook_default,
    customGreeting_default,
    cleaner_default,
    noShareLink_default,
    noDictation_default,
    streamerMode_default,
    recentChats_default,
    exportChat_default,
    messageTimestamps_default,
    collapseCode_default,
    betterLinks_default,
    noTelemetry_default,
    consoleJanitor_default,
    sidebarDefaultCode_default,
    chatNoticeHider_default,
    runningPill_default,
    customIdentity_default,
    hideIdentity_default,
    autoRetry_default,
    codeBrandColor_default
  ];

  // src/index.ts
  var FLAG = "__ccpp";
  var GLOBAL = "CCPP";
  var logger12 = new Logger("Kernel");
  function exposeRuntime(win) {
    const runtime = Object.freeze({
      version: "0.3.99",
      get plugins() {
        return allPlugins().map(pluginInfo);
      },
      plugin(name) {
        const found = allPlugins().find((p) => p.name === name);
        return found ? pluginInfo(found) : null;
      }
    });
    try {
      Object.defineProperty(win, GLOBAL, { value: runtime, enumerable: false, configurable: false, writable: false });
    } catch {}
  }
  function boot() {
    const win = pageWindow;
    if (win[FLAG] || !isTopDocument())
      return;
    win[FLAG] = "0.3.99";
    registerPlugins(PLUGINS);
    exposeRuntime(win);
    installTooltips();
    startPhase("document-start");
    const ready = () => startPhase("dom-ready");
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", ready, { once: true });
    else
      ready();
    pageWindow.addEventListener("storage", (event) => {
      if (event.key !== PREFIX + SETTINGS_KEY)
        return;
      try {
        replaceBag(JSON.parse(event.newValue ?? "{}"));
      } catch {}
    });
    logger12.info(`CC++ ${"0.3.99"} started with ${PLUGINS.length} plugins`);
  }
  boot();
})();
