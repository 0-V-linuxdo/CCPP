// ==UserScript==
// @name         CC++
// @namespace    https://github.com/0-V-linuxdo/CCPP
// @version      20261013.0.1.0
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
    return {
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
  async function getChannelSessions(signal) {
    if (channelSessions && Date.now() - channelSessions.at < CHANNEL_LIST_TTL)
      return channelSessions.map;
    const map = parseChannelSessions(await getCodeJson("/v1/code/channels?scope=joined&include_archived=false&limit=200", signal));
    channelSessions = { at: Date.now(), map };
    return map;
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
  var current = parseRoute(location.pathname);
  var currentRoute = () => current;
  function check() {
    const path = location.pathname;
    if (path === current.path)
      return;
    const previous = current;
    current = parseRoute(path);
    emit("route", { route: current, previous });
  }
  function onRoute(scope, fn, immediate = true) {
    scope.on("route", ({ route, previous }) => fn(route, previous));
    if (immediate)
      fn(current, null);
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
      const history = pageWindow.history;
      const originals = { pushState: history.pushState, replaceState: history.replaceState };
      for (const key of ["pushState", "replaceState"]) {
        const original = originals[key];
        const patched = function(...args) {
          const result = original.apply(this, args);
          queueMicrotask(check);
          return result;
        };
        history[key] = patched;
        scope.defer(() => {
          if (history[key] === patched)
            history[key] = original;
        });
      }
      scope.listen(pageWindow, "popstate", check);
      scope.interval(check, 700);
      current = parseRoute(location.pathname);
    }
  });

  // src/plugins/_api/dom/selectors.ts
  var SEL = {
    sidebar: '[data-testid="sidebar"]',
    sidebarRecents: '[data-testid="sidebar-recents"]',
    sidebarChatLink: 'a[href^="/chat/"]',
    userMenuButton: '[data-testid="user-menu-button"]',
    userMenuName: '[data-testid="user-menu-button"] .df-user-menu-trailing',
    avatar: '[data-cds="Avatar"]',
    chatHeader: '[data-testid="chat-header"]',
    headerActions: "#dframe-header-actions-slot",
    shareButton: '[data-testid="wiggle-controls-actions-share"]',
    transcript: '[data-testid="transcript-list"]',
    transcriptFeed: '[role="feed"][aria-label]',
    transcriptRow: '[data-testid="transcript-row"]',
    scroller: '[data-autoscroll-container="true"]',
    userMessage: '[data-testid="user-message"]',
    userMessageBody: ".cds-user-message-body",
    assistantMessage: '[data-testid="assistant-message"]',
    streaming: '[data-testid="assistant-message"][data-is-streaming="true"]',
    messageActions: '[data-testid="message-actions"]',
    messageTime: 'time[data-cds="RelativeTime"]',
    prose: '[data-cds="Prose"]',
    composer: '[data-cds="ChatComposer"]',
    composerCard: "[data-composer-card-holder]",
    editor: '[data-testid="chat-input"]',
    sendButton: '[data-testid="chat-input-send"]',
    modelSelector: '[data-testid="model-selector-dropdown"]',
    greeting: "[data-new-page-greeting-text]",
    menu: '[role="menu"]',
    menuItem: '[role="menuitem"]',
    jumpToLatest: '[data-testid="jump-to-latest"]'
  };

  // src/plugins/_api/dom/index.ts
  var logger5 = new Logger("DomApi");
  var watchers = new Set;
  var observer = null;
  var pending = null;
  var FLUSH_MS = 60;
  function runCleanup(cleanup) {
    try {
      cleanup?.();
    } catch (error) {
      logger5.error("Watcher cleanup failed:", error);
    }
  }
  function flushWatcher(watcher) {
    const found = new Set(document.querySelectorAll(watcher.selector));
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
        logger5.error(`Watcher for ${watcher.selector} failed:`, error);
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
    observer.observe(document.documentElement, { childList: true, subtree: true });
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
      observer = new MutationObserver(schedule);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      scope.defer(() => {
        observer?.disconnect();
        observer = null;
        if (pending)
          clearTimeout(pending);
        pending = null;
      });
    }
  });

  // src/plugins/_api/chatState/index.ts
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
    description: { zh: "判断 Claude 是否正在回复，并在开始 / 结束时通知其它插件（后台标签页也有效）。", en: "Knows when Claude starts and finishes replying, also in background tabs." },
    category: "api",
    icon: "sparkles",
    hidden: true,
    dependencies: ["RouterApi"],
    start(scope) {
      phase2 = "idle";
      quietTicks = 0;
      scope.interval(() => tick(!!document.querySelector(SEL.streaming)), CHECK_MS);
      scope.on("route", () => {
        phase2 = "idle";
        quietTicks = 0;
      });
    }
  });

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
  function caretToEnd(editor = getEditor()) {
    if (!editor)
      return;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
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
    return insertText(text, editor);
  }
  function onSubmit(scope, fn) {
    scope.listen(document, "keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229)
        return;
      const target = event.target;
      if (!target?.closest?.(SEL.editor))
        return;
      const text = getText(target.closest(SEL.editor));
      if (text)
        fn(text);
    }, { capture: true });
    scope.listen(document, "click", (event) => {
      const button = event.target?.closest?.(SEL.sendButton);
      if (!button || button.disabled)
        return;
      const text = getText();
      if (text)
        fn(text);
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
  function comboLabel(spec) {
    const combo = parseCombo(spec);
    const mac = isMac();
    const parts = [combo.ctrl && (mac ? "⌃" : "Ctrl"), combo.alt && (mac ? "⌥" : "Alt"), combo.shift && (mac ? "⇧" : "Shift"), combo.meta && (mac ? "⌘" : "Win"), combo.key.length === 1 ? combo.key.toUpperCase() : combo.key];
    return parts.filter(Boolean).join(mac ? "" : "+");
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

  // src/plugins/_api/network/index.ts
  var logger6 = new Logger("NetworkApi");
  var responseHooks = new Set;
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
      const wrapped = function fetch(input, init) {
        const req = describe(input, init);
        if (req && blockers.size && isBlocked(req))
          return Promise.resolve(new Response(null, { status: 204 }));
        const promise = original.call(this ?? pageWindow, input, init);
        if (req && responseHooks.size) {
          const hooks = [...responseHooks].filter((hook) => {
            try {
              return hook.match(req);
            } catch {
              return false;
            }
          });
          if (hooks.length) {
            promise.then((response) => {
              for (const hook of hooks) {
                try {
                  hook.handle(response.clone(), req);
                } catch (error) {
                  logger6.error("Response hook failed:", error);
                }
              }
            }, () => {});
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
    grid: [p("M3 3h7v7H3z"), p("M14 3h7v7h-7z"), p("M14 14h7v7h-7z"), p("M3 14h7v7H3z")],
    fileText: [p("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"), p("M14 2v4a2 2 0 0 0 2 2h4"), p("M16 13H8"), p("M16 17H8"), p("M10 9H8")],
    terminal: [p("m4 17 6-6-6-6"), p("M12 19h8")],
    incognito: [p("M2 12h20"), p("M5 12l2-7h10l2 7"), c(7, 17, 3), c(17, 17, 3), p("M10 17h4")],
    blend: [c(9, 9, 7), c(15, 15, 7)],
    tab: [p("M3 5h18v14H3z"), p("M3 9h18")],
    collapse: [p("m7 20 5-5 5 5"), p("m7 4 5 5 5-5")],
    puzzle: [p("M19.44 12.06a2 2 0 1 0-2.83-2.83L14 6.6V4a2 2 0 0 0-2-2H8v2.5a2 2 0 1 1-4 0V2H2v6h2.5a2 2 0 1 1 0 4H2v8h8v-2.5a2 2 0 1 1 4 0V20h4a2 2 0 0 0 2-2v-4l-.56-1.94Z")]
  };
  var iconNames = Object.keys(ICONS);
  function icon(name, size = 16) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const attrs = {
      width: String(size),
      height: String(size),
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
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
.ccpp { --bg: #ffffff; --bg2: #f5f4ef; --bg3: #ebe9e1; --fg: #1f1e1d; --fg2: #5e5d59; --fg3: #8f8d86; --line: rgba(31,30,29,.12);
  --accent: #d97757; --accent-fg: #fff; --ok: #3f9a5b; --warn: #c98a12; --bad: #d1453b; --shadow: 0 8px 32px rgba(0,0,0,.18);
  font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--fg); }
.ccpp.dark { --bg: #262624; --bg2: #30302e; --bg3: #3a3a37; --fg: #f5f4ef; --fg2: #c2c0b6; --fg3: #8f8d86; --line: rgba(255,255,255,.1); --shadow: 0 8px 32px rgba(0,0,0,.5); }
.ccpp * { box-sizing: border-box; }
.ccpp button { font: inherit; color: inherit; cursor: pointer; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg2); }
.btn:hover { background: var(--bg3); }
.btn.primary { background: var(--accent); color: var(--accent-fg); border-color: transparent; }
.btn.danger { color: var(--bad); }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--fg2); }
.icon-btn:hover { background: var(--bg3); color: var(--fg); }
.icon-btn.on { color: var(--accent); }
.input { height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); font: inherit; outline: none; width: 100%; }
.input:focus, textarea.input:focus { border-color: var(--accent); }
textarea.input { height: auto; padding: 8px 10px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.switch { position: relative; width: 34px; height: 20px; flex: none; border-radius: 10px; border: 0; background: var(--bg3); padding: 0; transition: background .15s; }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .15s; }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"]::after { transform: translateX(14px); }
.switch:disabled { opacity: .5; cursor: not-allowed; }
.muted { color: var(--fg3); }
.badge { display: inline-block; padding: 0 6px; border-radius: 6px; font-size: 11px; line-height: 18px; background: var(--bg3); color: var(--fg2); }
.badge.accent { background: var(--accent); color: var(--accent-fg); }
.badge.bad { background: var(--bad); color: #fff; }
@media (prefers-reduced-motion: reduce) { .ccpp * { transition: none !important; animation: none !important; } }
`;
  function createHost(scope, id, css, options = {}) {
    const host = h("div", { id: `ccpp-${id}`, "data-ccpp": id });
    if (options.fixed !== false)
      Object.assign(host.style, { position: "fixed", inset: "0", zIndex: "2147483600", pointerEvents: "none" });
    const root = host.attachShadow({ mode: "open" });
    root.appendChild(h("style", { text: BASE_CSS + css }));
    const box = h("div", { class: "ccpp" });
    root.appendChild(box);
    const sync = () => box.classList.toggle("dark", isDark());
    sync();
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

  // src/plugins/_api/notices/index.ts
  var CSS = `
.stack { position: fixed; top: 64px; right: 16px; display: flex; flex-direction: column; gap: 8px; width: min(340px, calc(100vw - 32px)); pointer-events: none; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 10px 10px 12px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); animation: in .18s ease-out; }
.toast.click { cursor: pointer; }
.toast .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: none; background: var(--accent); }
.toast.ok .dot { background: var(--ok); } .toast.warn .dot { background: var(--warn); } .toast.error .dot { background: var(--bad); }
.toast .body { flex: 1; min-width: 0; } .toast .title { font-weight: 600; } .toast .text { color: var(--fg2); word-break: break-word; }
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
      host = createHost(scope, "notices", CSS);
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
  var containers = new Map([["composer", new Set], ["header", new Set]]);
  var CSS2 = `
.ccpp-slot { display: inline-flex; align-items: center; gap: 4px; flex: none; }
.ccpp-slot:empty { display: none; }
.ccpp-slot-composer { margin-inline-end: 4px; }
.ccpp-slot-header { margin-inline-end: 4px; }
.ccpp-slot-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 0; background: transparent; color: inherit; opacity: .75; font: inherit; font-size: 12px; cursor: pointer; }
.ccpp-slot-btn:hover { opacity: 1; background: rgba(127,127,127,.14); }
.ccpp-slot-btn.on { color: #d97757; opacity: 1; }
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
  var slotButton = (label, onClick, ...children) => h("button", { type: "button", class: "ccpp-slot-btn", "aria-label": label, title: label, onclick: onClick }, ...children);
  var slots_default = definePlugin({
    name: "SlotsApi",
    title: { zh: "界面插槽", en: "UI slots API" },
    description: { zh: "在输入框模型选择器旁、对话标题栏右侧放置插件按钮。", en: "Puts plugin controls next to the model picker and in the chat header." },
    category: "api",
    icon: "grid",
    hidden: true,
    dependencies: ["DomApi", "StylesApi"],
    start(scope) {
      addStyle(scope, CSS2, "slots");
      const mountIn = (slot, anchor, where) => {
        const container = h("span", { class: `ccpp-slot ccpp-slot-${slot}`, "data-ccpp-slot": slot });
        if (where === "before")
          anchor.before(container);
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
    }
  });

  // src/plugins/_api/transcript/index.ts
  var getScroller = () => document.querySelector(SEL.scroller);
  function getRows() {
    return [...document.querySelectorAll(SEL.transcriptRow)].map((el) => {
      const index = Number(el.dataset.index);
      const message = el.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
      const role = message?.matches(SEL.userMessage) || el.dataset.perfRow === "human" ? "user" : "assistant";
      const keyed = el.querySelector("[data-turn-key]");
      return { index, el, role, turnKey: keyed?.dataset.turnKey ?? null };
    }).filter((row) => Number.isFinite(row.index)).sort((a, b) => a.index - b.index);
  }
  function totalMessages() {
    const article = document.querySelector(`${SEL.transcriptRow} [role="article"][aria-setsize]`);
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
    const scroller = getScroller();
    if (!scroller)
      return null;
    for (let attempt = 0;attempt < 16; attempt++) {
      const rows = getRows();
      const row = rows.find((r) => r.index === index);
      if (row) {
        scrollRowIntoView(scroller, row.el, options.behavior ?? "smooth");
        if (options.flash !== false)
          flash(row.el);
        return row.el;
      }
      if (!rows.length) {
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
  function flash(el) {
    el.classList.remove("ccpp-flash");
    el.offsetWidth;
    el.classList.add("ccpp-flash");
    setTimeout(() => el.classList.remove("ccpp-flash"), 1600);
  }
  function currentIndex() {
    const scroller = getScroller();
    if (!scroller)
      return null;
    const top = scroller.getBoundingClientRect().top + JUMP_OFFSET + 8;
    let best = null;
    for (const row of getRows()) {
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
  var CSS3 = `
@keyframes ccpp-flash { 0% { box-shadow: 0 0 0 2px rgba(217,119,87,.9); } 100% { box-shadow: 0 0 0 2px rgba(217,119,87,0); } }
.ccpp-flash { border-radius: 12px; animation: ccpp-flash 1.6s ease-out; }
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
      addStyle(scope, CSS3, "transcript");
      scope.on("reply:end", ({ chatId }) => invalidateConversation(chatId));
      scope.defer(() => cache.clear());
    }
  });

  // src/kernel/i18n.ts
  var detect = () => /^zh/i.test(globalThis.navigator?.language ?? "") ? "zh" : "en";
  var lang = detect();
  var getLang = () => lang;
  var setLang = (next) => void (lang = next === "auto" ? detect() : next);
  var t = (text) => typeof text === "string" ? text : text[lang];

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
    const label = h("div", { class: "opt-label", text: t(option.label) });
    const desc = option.description ? h("div", { class: "opt-desc", text: t(option.description) }) : null;
    switch (option.type) {
      case "boolean": {
        const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(value), "aria-label": t(option.label) });
        sw.addEventListener("click", () => {
          const next = sw.getAttribute("aria-checked") !== "true";
          sw.setAttribute("aria-checked", String(next));
          set(next);
        });
        return h("div", { class: "opt" }, label, sw, desc);
      }
      case "number": {
        const output = h("output", { text: `${value}${option.unit ?? ""}` });
        const input = h("input", { type: "range", min: option.min, max: option.max, step: option.step ?? 1, value: String(value) });
        input.addEventListener("input", () => output.textContent = `${input.value}${option.unit ?? ""}`);
        input.addEventListener("change", () => set(Number(input.value)));
        return h("div", { class: "opt" }, label, h("div", { class: "range" }, input, output), desc);
      }
      case "select": {
        const select = h("select", { class: "input" }, ...option.options.map((o) => h("option", { value: o.value, text: t(o.label), selected: o.value === value })));
        select.addEventListener("change", () => set(select.value));
        return h("div", { class: "opt" }, label, select, desc);
      }
      case "color": {
        const input = h("input", { type: "color", value: String(value) });
        input.addEventListener("change", () => set(input.value));
        return h("div", { class: "opt" }, label, input, desc);
      }
      case "string": {
        const input = h("input", { class: "input", value: String(value ?? ""), placeholder: option.placeholder ? t(option.placeholder) : "", maxLength: option.maxLength ?? 2000 });
        input.addEventListener("change", () => set(input.value));
        return h("div", { class: "opt wide" }, label, input, desc);
      }
      case "text": {
        const area = h("textarea", { class: "input", rows: option.rows ?? 5, placeholder: option.placeholder ? t(option.placeholder) : "" });
        area.value = String(value ?? "");
        area.addEventListener("change", () => set(area.value));
        return h("div", { class: "opt wide" }, label, area, desc);
      }
      case "action": {
        const button = h("button", { type: "button", class: "btn", text: t(option.button) });
        button.addEventListener("click", () => {
          if (option.confirm && !confirm(t(option.confirm)))
            return;
          option.run();
        });
        return h("div", { class: "opt" }, label, button, desc);
      }
    }
  }

  // src/plugins/_core/settings/styles.ts
  var DIALOG_CSS = `
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

  // src/plugins/_core/settings/index.ts
  var version = "[20261013] v0.1.0";
  var tabs = new Map;
  function registerTab(scope, tab) {
    tabs.set(tab.id, tab);
    scope.defer(() => {
      tabs.delete(tab.id);
      if (state.tab === tab.id)
        state.tab = "plugins";
      render();
    });
    render();
  }
  var CATEGORY_LABELS = {
    favorites: { zh: "收藏", en: "Favorites" },
    recent: { zh: "最近", en: "Recent" },
    all: { zh: "全部", en: "All" },
    composer: { zh: "输入框", en: "Composer" },
    messages: { zh: "消息", en: "Messages" },
    chats: { zh: "对话", en: "Chats" },
    usage: { zh: "用量", en: "Usage" },
    notifications: { zh: "通知", en: "Notifications" },
    appearance: { zh: "外观", en: "Appearance" },
    declutter: { zh: "精简", en: "Declutter" },
    privacy: { zh: "隐私", en: "Privacy" },
    developer: { zh: "开发者", en: "Developer" },
    core: { zh: "核心", en: "Core" },
    api: { zh: "API", en: "API" }
  };
  var CATEGORY_ORDER = ["favorites", "recent", "all", "composer", "messages", "chats", "usage", "notifications", "appearance", "declutter", "privacy", "developer", "core", "api"];
  var L = {
    plugins: { zh: "插件", en: "Plugins" },
    search: { zh: "搜索插件…", en: "Search plugins…" },
    reload: { zh: "以下插件需要刷新页面才能完全生效：", en: "Reload to fully apply:" },
    reloadNow: { zh: "立即刷新", en: "Reload" },
    empty: { zh: "没有匹配的插件", en: "No matching plugins" },
    favorite: { zh: "收藏", en: "Favorite" },
    pin: { zh: "置顶", en: "Pin to top" },
    options: { zh: "选项", en: "Options" },
    reset: { zh: "恢复默认", en: "Reset to defaults" },
    resetConfirm: { zh: "把这个插件的选项恢复默认？", en: "Reset this plugin's options?" },
    newBadge: { zh: "新", en: "New" },
    updated: { zh: "近期更新", en: "Updated" },
    needsReload: { zh: "需刷新", en: "Reload" },
    required: { zh: "必需", en: "Required" },
    error: { zh: "出错", en: "Error" },
    dependsOn: { zh: "依赖：", en: "Needs: " },
    keptBy: { zh: "被以下插件需要，保持开启：", en: "Kept on by: " },
    close: { zh: "关闭", en: "Close" },
    openSettings: { zh: "CC++ 设置", en: "CC++ settings" }
  };
  var isPrefs = (v) => !!v && Array.isArray(v.favorites) && Array.isArray(v.pinned);
  var prefs = persisted("settings-ui", { favorites: [], pinned: [] }, isPrefs);
  var state = { open: false, tab: "plugins", category: "", query: "", expanded: new Set };
  var host2 = null;
  var scrollTop = 0;
  var settings = definePluginSettings({
    language: {
      type: "select",
      label: { zh: "界面语言", en: "Language" },
      default: "auto",
      options: [
        { value: "auto", label: { zh: "跟随浏览器", en: "Follow browser" } },
        { value: "zh", label: "中文" },
        { value: "en", label: "English" }
      ]
    },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "例如 mod+shift+, （mod = ⌘ / Ctrl），留空关闭。", en: "e.g. mod+shift+, (mod = ⌘ / Ctrl). Empty disables it." }, default: "mod+shift+," },
    userMenuEntry: { type: "boolean", label: { zh: "在头像菜单里显示入口", en: "Entry in the account menu" }, default: true },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示齿轮按钮", en: "Gear button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, description: { zh: "它们由其它插件按需自动开启。", en: "They are switched on automatically when another plugin needs them." }, default: false }
  });
  var isFavorite = (name) => prefs.get().favorites.includes(name);
  var isPinned = (name) => prefs.get().pinned.includes(name);
  var toggleIn = (key, name) => {
    const current = prefs.get();
    const list = current[key].includes(name) ? current[key].filter((n) => n !== name) : [...current[key], name];
    prefs.set({ ...current, [key]: list });
  };
  var visiblePlugins = () => allPlugins().filter((p) => settings.store.showApiPlugins || !(p.hidden || p.category === "api"));
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
    return plugin.category === category;
  }
  function defaultCategory() {
    return prefs.get().favorites.some((name) => getPlugin(name)) ? "favorites" : "all";
  }
  function pluginCard(plugin) {
    const enabled = isEnabled(plugin);
    const active = isActive(plugin);
    const keptBy = !enabled ? activeDependents(plugin.name) : [];
    const error = pluginError(plugin.name);
    const open = state.expanded.has(plugin.name);
    const hasOptions = !!plugin.settings && Object.keys(plugin.settings.def).length > 0;
    const sw = h("button", {
      type: "button",
      class: "switch",
      role: "switch",
      "aria-checked": String(active),
      "aria-label": t(plugin.title),
      disabled: !!plugin.required || keptBy.length > 0,
      title: keptBy.length ? t(L.keptBy) + keptBy.map((p) => t(p.title)).join(", ") : ""
    });
    sw.addEventListener("click", () => setEnabled(plugin, !enabled));
    const actions = h("div", { class: "card-actions" }, h("button", { type: "button", class: `icon-btn${isFavorite(plugin.name) ? " on" : ""}`, title: t(L.favorite), "aria-label": t(L.favorite), onclick: () => (toggleIn("favorites", plugin.name), render()) }, icon("star", 14)), h("button", { type: "button", class: `icon-btn${isPinned(plugin.name) ? " on" : ""}`, title: t(L.pin), "aria-label": t(L.pin), onclick: () => (toggleIn("pinned", plugin.name), render()) }, icon("pin", 14)), hasOptions ? h("button", { type: "button", class: `icon-btn${open ? " on" : ""}`, title: t(L.options), "aria-label": t(L.options), "aria-expanded": String(open), onclick: () => (open ? state.expanded.delete(plugin.name) : state.expanded.add(plugin.name), render()) }, icon("settings", 14)) : null);
    const badges = [];
    if (isNew(plugin.name))
      badges.push(h("span", { class: "badge accent", text: t(L.newBadge) }));
    else if (isRecent(plugin))
      badges.push(h("span", { class: "badge", text: t(L.updated) }));
    if (plugin.required)
      badges.push(h("span", { class: "badge", text: t(L.required) }));
    if (pendingRestart().includes(plugin))
      badges.push(h("span", { class: "badge accent", text: t(L.needsReload) }));
    if (error)
      badges.push(h("span", { class: "badge bad", text: t(L.error) }));
    if (plugin.dependencies?.length && settings.store.showApiPlugins)
      badges.push(h("span", { class: "badge", text: t(L.dependsOn) + plugin.dependencies.join(", ") }));
    const card = h("div", { class: `card${active ? " on" : " off"}${open ? " open" : ""}`, "data-plugin": plugin.name }, h("div", { class: "card-top" }, h("span", { class: "card-icon" }, icon(plugin.icon ?? "puzzle", 16)), h("span", { class: "card-title", text: t(plugin.title), title: plugin.name }), actions, sw), h("div", { class: "card-desc", text: t(plugin.description) }), badges.length ? h("div", { class: "card-meta" }, ...badges) : null, error ? h("div", { class: "err", text: `${error.stage}: ${error.message}` }) : null);
    if (open && plugin.settings) {
      const rows = Object.entries(plugin.settings.def).map(([key, option]) => renderOption(plugin.settings, key, option, render)).filter(Boolean);
      const reset = h("button", { type: "button", class: "btn", text: t(L.reset) });
      reset.addEventListener("click", () => {
        if (!confirm(t(L.resetConfirm)))
          return;
        plugin.settings.reset();
        render();
      });
      card.appendChild(h("div", { class: "options" }, ...rows, h("div", { class: "opt-foot" }, reset)));
    }
    return card;
  }
  function renderPlugins(container) {
    if (!state.category)
      state.category = defaultCategory();
    const plugins = visiblePlugins();
    const searchInput = h("input", { class: "input", type: "search", placeholder: t(L.search), value: state.query, "aria-label": t(L.search) });
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value;
      renderList();
    });
    container.appendChild(h("div", { class: "toolbar" }, h("label", { class: "search" }, icon("search", 14), searchInput)));
    const categories = CATEGORY_ORDER.filter((cat) => ["favorites", "recent", "all"].includes(cat) || plugins.some((p) => p.category === cat));
    const chips = h("div", { class: "chips", role: "tablist" });
    for (const cat of categories) {
      const count = plugins.filter((p) => inCategory(p, cat)).length;
      const chip = h("button", { type: "button", role: "tab", class: `chip${state.category === cat ? " active" : ""}`, "aria-selected": String(state.category === cat) }, t(CATEGORY_LABELS[cat]), h("span", { class: "n", text: count }));
      chip.addEventListener("click", () => {
        state.category = cat;
        render();
      });
      chips.appendChild(chip);
    }
    container.appendChild(chips);
    const pending = pendingRestart();
    if (pending.length) {
      container.appendChild(h("div", { class: "banner" }, h("span", { text: t(L.reload) + " " + pending.map((p) => t(p.title)).join("、") }), h("button", { type: "button", class: "btn primary", text: t(L.reloadNow), onclick: () => location.reload() })));
    }
    const list = h("div");
    container.appendChild(list);
    const renderList = () => {
      clear(list);
      const shown = plugins.filter((p) => (state.query ? true : inCategory(p, state.category)) && matchesQuery(p, state.query)).sort((a, b) => Number(isPinned(b.name)) - Number(isPinned(a.name)) || t(a.title).localeCompare(t(b.title)));
      if (!shown.length) {
        list.appendChild(h("div", { class: "empty", text: t(L.empty) }));
        return;
      }
      list.appendChild(h("div", { class: "grid" }, ...shown.map(pluginCard)));
    };
    renderList();
    if (state.query)
      queueMicrotask(() => {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      });
  }
  function render() {
    if (!host2)
      return;
    const previous = host2.box.querySelector(".content");
    if (previous)
      scrollTop = previous.scrollTop;
    clear(host2.box);
    if (!state.open)
      return;
    const allTabs = [{ id: "plugins", title: L.plugins, icon: "plug", order: 0, render: renderPlugins }, ...[...tabs.values()]].sort((a, b) => a.order - b.order);
    const current = allTabs.find((tab) => tab.id === state.tab) ?? allTabs[0];
    const nav = h("nav", { class: "nav" }, h("div", { class: "brand" }, h("b", { text: "CC++" }), h("span", { text: version })));
    for (const tab of allTabs) {
      const button = h("button", { type: "button", class: `tab${tab === current ? " active" : ""}` }, icon(tab.icon, 15), t(tab.title));
      button.addEventListener("click", () => {
        state.tab = tab.id;
        scrollTop = 0;
        render();
      });
      nav.appendChild(button);
    }
    const content = h("div", { class: "content" });
    const main = h("div", { class: "main" }, h("div", { class: "head" }, h("h2", { text: t(current.title) }), h("button", { type: "button", class: "icon-btn", "aria-label": t(L.close), title: `${t(L.close)} (Esc)`, onclick: closeSettings }, icon("x", 16))), content);
    const dialog = h("div", { class: "dialog", role: "dialog", "aria-modal": "true", "aria-label": t(L.openSettings) }, nav, main);
    const backdrop = h("div", { class: "backdrop" }, dialog);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop)
        closeSettings();
    });
    host2.box.appendChild(backdrop);
    try {
      current.render(content);
    } catch (error) {
      content.appendChild(h("div", { class: "err", text: String(error) }));
    }
    content.scrollTop = scrollTop;
  }
  function openSettings(options = {}) {
    state.open = true;
    state.tab = options.tab ?? state.tab;
    if (options.plugin) {
      state.tab = "plugins";
      state.category = "all";
      state.query = "";
      state.expanded.add(options.plugin);
    }
    render();
    if (options.plugin)
      queueMicrotask(() => host2?.box.querySelector(`[data-plugin="${options.plugin}"]`)?.scrollIntoView({ block: "center" }));
  }
  function closeSettings() {
    state.open = false;
    scrollTop = 0;
    render();
  }
  function injectUserMenuEntry(scope) {
    let armedUntil = 0;
    scope.listen(document, "pointerdown", (event) => {
      if (event.target?.closest?.(SEL.userMenuButton))
        armedUntil = Date.now() + 3000;
    }, { capture: true });
    scope.listen(document, "keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target?.closest?.(SEL.userMenuButton))
        armedUntil = Date.now() + 3000;
    }, { capture: true });
    watch(scope, SEL.menu, (menu) => {
      if (Date.now() > armedUntil || !settings.store.userMenuEntry)
        return;
      const sample = menu.querySelector(SEL.menuItem);
      const item = h("div", { role: "menuitem", tabindex: "-1", class: sample?.className ?? "", "data-ccpp-entry": "", style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" } }, icon("plug", 16), h("span", { text: t(L.openSettings) }));
      const activate = (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        openSettings();
      };
      item.addEventListener("click", activate);
      item.addEventListener("keydown", (event) => (event.key === "Enter" || event.key === " ") && activate(event));
      const separator = menu.querySelector('[role="separator"]');
      if (separator)
        separator.after(item);
      else
        menu.prepend(item);
      return () => item.remove();
    });
  }
  var settings_default = definePlugin({
    name: "Settings",
    title: { zh: "设置面板", en: "Settings" },
    description: { zh: "CC++ 的设置面板本身也是插件：插件开关、分类、搜索、收藏、置顶与选项。", en: "The CC++ settings panel, itself a plugin: switches, categories, search, favorites, pins and options." },
    category: "core",
    icon: "settings",
    required: true,
    dependencies: ["DomApi", "HotkeysApi", "MenuApi", "SlotsApi"],
    settings,
    start(scope) {
      setLang(settings.store.language);
      host2 = createHost(scope, "settings", DIALOG_CSS);
      scope.defer(() => host2 = null);
      scope.listen(window, "keydown", (event) => {
        if (event.key === "Escape" && state.open) {
          event.stopPropagation();
          closeSettings();
        }
      }, { capture: true });
      scope.defer(onPluginStateChange(() => state.open && render()));
      scope.defer(prefs.subscribe(() => state.open && render()));
      if (settings.store.hotkey.trim())
        bindKey(scope, settings.store.hotkey, () => state.open ? closeSettings() : openSettings(), { inInputs: true });
      addMenuCommand(scope, `⚙️ ${t(L.openSettings)}${settings.store.hotkey ? ` (${comboLabel(settings.store.hotkey)})` : ""}`, () => openSettings());
      injectUserMenuEntry(scope);
      if (settings.store.composerEntry)
        addSlotItem(scope, "composer", "settings", () => slotButton(t(L.openSettings), () => openSettings(), icon("plug", 16)), 100);
      if (state.open)
        render();
    },
    onSettingsChange(key) {
      if (key === "language")
        setLang(settings.store.language);
      if (key === "showApiPlugins" || key === "language")
        render();
      if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry")
        queueMicrotask(() => restartPlugin(getPlugin("Settings")));
    }
  });

  // src/plugins/_core/backup/index.ts
  var L2 = {
    title: { zh: "备份与关于", en: "Backup & about" },
    backup: { zh: "备份", en: "Backup" },
    backupHint: { zh: "导出全部 CC++ 数据（插件开关、选项、收藏的消息、输入历史、自定义 CSS），可在另一台电脑导入。", en: "Export all CC++ data (switches, options, starred messages, prompt history, Quick CSS) to restore elsewhere." },
    export: { zh: "导出 JSON", en: "Export JSON" },
    import: { zh: "导入 JSON", en: "Import JSON" },
    reset: { zh: "清空全部数据", en: "Erase all data" },
    resetConfirm: { zh: "清空 CC++ 的全部设置与数据？此操作不可撤销。", en: "Erase every CC++ setting and data? This cannot be undone." },
    imported: { zh: "已导入，部分插件可能需要刷新页面。", en: "Imported. Some plugins may need a reload." },
    bad: { zh: "文件不是 CC++ 备份。", en: "That file is not a CC++ backup." },
    about: { zh: "关于", en: "About" },
    aboutText: {
      zh: "CC++ 是 claude.ai 的插件化用户脚本：内核只负责插件注册、依赖与设置，网络、路由、DOM 观察、设置面板本身也都是插件。只调用 claude.ai 同源接口，不读取或外传 Cookie / token，不连接任何第三方服务器。",
      en: "CC++ is a plugin-based userscript for claude.ai. The kernel only registers plugins, resolves dependencies and stores settings; network, routing, DOM watching and this settings panel are plugins too. It only calls claude.ai's same-origin API, never reads or sends cookies or tokens, and talks to no third-party server."
    },
    stats: { zh: "已启用 {on} / {all} 个插件", en: "{on} of {all} plugins running" }
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
  var backup_default = definePlugin({
    name: "Backup",
    title: L2.title,
    description: { zh: "导出 / 导入 / 清空 CC++ 的全部设置与数据。", en: "Export, import or erase all CC++ settings and data." },
    category: "core",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["Settings", "NoticesApi"],
    start(scope) {
      registerTab(scope, {
        id: "backup",
        title: L2.title,
        icon: "download",
        order: 20,
        render(container) {
          const file = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
          file.addEventListener("change", async () => {
            const chosen = file.files?.[0];
            if (!chosen)
              return;
            try {
              if (!restoreBackup(JSON.parse(await chosen.text())))
                throw new Error("format");
              toast(t(L2.imported), { kind: "ok" });
            } catch {
              toast(t(L2.bad), { kind: "error" });
            }
            file.value = "";
          });
          const exportBtn = h("button", { type: "button", class: "btn primary" }, icon("download", 14), t(L2.export));
          exportBtn.addEventListener("click", () => download(`ccpp-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), "application/json"));
          const importBtn = h("button", { type: "button", class: "btn" }, icon("upload", 14), t(L2.import));
          importBtn.addEventListener("click", () => file.click());
          const resetBtn = h("button", { type: "button", class: "btn danger" }, icon("trash", 14), t(L2.reset));
          resetBtn.addEventListener("click", () => {
            if (!confirm(t(L2.resetConfirm)))
              return;
            for (const key of Object.keys(dumpAll()))
              removeKey(key);
            location.reload();
          });
          const plugins = allPlugins().filter((p) => !p.hidden && p.category !== "api");
          container.append(h("div", { class: "section" }, h("h3", { text: t(L2.backup) }), h("p", { text: t(L2.backupHint) }), h("div", { class: "row" }, exportBtn, importBtn, resetBtn, file)), h("div", { class: "section" }, h("h3", { text: t(L2.about) }), h("p", { text: t(L2.aboutText) }), h("p", { class: "muted", text: `CC++ ${version} · ` + t(L2.stats).replace("{on}", String(plugins.filter((p) => isActive(p)).length)).replace("{all}", String(plugins.length)) }), h("p", {}, h("a", { href: "https://github.com/0-V-linuxdo/CCPP", target: "_blank", rel: "noopener", text: "github.com/0-V-linuxdo/CCPP" }))));
        }
      });
    }
  });

  // src/plugins/_core/quickCss/index.ts
  var css = persisted("quick-css", "", (v) => typeof v === "string");
  var L3 = {
    title: { zh: "自定义 CSS", en: "Quick CSS" },
    hint: { zh: "写入的 CSS 会实时应用到 claude.ai（输入停顿 0.4 秒后生效）。", en: "CSS here applies to claude.ai live (0.4 s after you stop typing)." },
    placeholder: { zh: `/* 例如：隐藏侧栏底部头像 */
[data-testid="user-menu-button"] { opacity: .6; }`, en: `/* e.g. dim the account button */
[data-testid="user-menu-button"] { opacity: .6; }` }
  };
  var quickCss_default = definePlugin({
    name: "QuickCss",
    title: L3.title,
    description: { zh: "在设置面板里写自己的 CSS，实时作用于页面。", en: "Write your own CSS in the settings panel and see it applied live." },
    category: "core",
    icon: "brush",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings"],
    start(scope) {
      const setCss = addStyle(scope, css.get(), "quick-css");
      scope.defer(css.subscribe(setCss));
      registerTab(scope, {
        id: "quick-css",
        title: L3.title,
        icon: "brush",
        order: 10,
        render(container) {
          const area = h("textarea", { class: "input", rows: 24, spellcheck: false, placeholder: t(L3.placeholder), style: { width: "100%", minHeight: "420px" } });
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
          container.append(h("p", { class: "muted", text: t(L3.hint), style: { margin: "0 0 10px" } }), area);
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
  var snippet = (text, max = 80) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
  };

  // src/lib/popover.ts
  var POPOVER_CSS = `
.panel { position: fixed; width: var(--w, 300px); max-height: min(70vh, 560px); overflow: auto; padding: 12px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; animation: pop .12s ease-out; }
@keyframes pop { from { opacity: 0; transform: translateY(4px); } }
.top { display: flex; align-items: center; gap: 6px; } .top b { flex: 1; font-size: 14px; }
.msg { color: var(--fg2); } .msg.bad { color: var(--bad); }
.item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 7px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; }
.item:hover, .item.active { background: var(--bg2); }
.item .grow { flex: 1; min-width: 0; } .item .sub { color: var(--fg3); font-size: 12px; }
.clip { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clip2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;
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
      if (!anchor.isConnected)
        return close();
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

  // src/plugins/usageDisplay/index.ts
  var logger7 = new Logger("UsageDisplay");
  var settings2 = definePluginSettings({
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
    warnAt: { type: "number", label: { zh: "黄色提醒阈值", en: "Amber from" }, default: 70, min: 10, max: 99, unit: "%" },
    dangerAt: { type: "number", label: { zh: "红色提醒阈值", en: "Red from" }, default: 90, min: 10, max: 100, unit: "%" }
  });
  var L4 = {
    title: { zh: "用量", en: "Usage" },
    session: { zh: "5 小时会话", en: "5-hour session" },
    weekly: { zh: "每周", en: "Weekly" },
    resetsIn: { zh: "{t}后重置", en: "Resets in {t}" },
    resetsAt: { zh: "重置于 {t}", en: "Resets {t}" },
    updated: { zh: "更新于 {t} · claude.ai 同源接口", en: "Updated {t} · claude.ai API" },
    refresh: { zh: "刷新", en: "Refresh" },
    open: { zh: "打开官方用量页", en: "Open usage page" },
    loading: { zh: "读取中…", en: "Loading…" },
    error: { zh: "读取用量失败：{e}", en: "Could not read usage: {e}" },
    signedOut: { zh: "未登录或无权读取用量", en: "Not signed in or no access to usage" },
    none: { zh: "当前套餐没有用量窗口", en: "No usage windows on this plan" }
  };
  var usage = null;
  var error = null;
  var loading = false;
  var lastAttempt = 0;
  var inflight = null;
  var listeners2 = new Set;
  var changed = () => listeners2.forEach((fn) => fn());
  var MIN_GAP_MS = 5000;
  async function refresh(force = false) {
    if (loading || !force && Date.now() - lastAttempt < MIN_GAP_MS)
      return;
    if (!force && document.hidden)
      return;
    loading = true;
    lastAttempt = Date.now();
    inflight = new AbortController;
    const timeout = setTimeout(() => inflight?.abort(), 12000);
    changed();
    try {
      usage = await getUsage(inflight.signal);
      error = null;
    } catch (err) {
      if (err.name === "AbortError" && !inflight)
        return;
      error = err instanceof ApiError && (err.status === 401 || err.status === 403) ? t(L4.signedOut) : err.message || String(err);
      logger7.warn("Usage refresh failed:", err);
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
  var COLORS = { ok: "#3f9a5b", warn: "#c98a12", bad: "#d1453b" };
  function ring(window2, label) {
    const percent = window2?.utilization ?? 0;
    const color = COLORS[level(percent, settings2.store.warnAt, settings2.store.dangerAt)];
    return h("span", {
      class: "ccpp-usage-ring",
      "aria-label": `${label} ${Math.round(percent)}%`,
      style: { background: window2 ? `conic-gradient(${color} ${percent * 3.6}deg, rgba(127,127,127,.25) 0)` : "rgba(127,127,127,.25)" }
    });
  }
  function chip(open) {
    const style = settings2.store.style;
    const five = usage?.fiveHour ?? null;
    const week = usage?.sevenDay ?? null;
    const pct = (w) => w ? `${Math.round(w.utilization)}%` : "–";
    const text = !usage ? error ? "!" : "…" : `${pct(five)} · ${pct(week)}`;
    const tip = usage ? `${t(L4.session)} ${pct(five)} · ${t(L4.weekly)} ${pct(week)}` : error ?? t(L4.loading);
    const button = h("button", { type: "button", class: `ccpp-slot-btn ccpp-usage${error && !usage ? " err" : ""}`, title: tip, "aria-label": tip }, style !== "text" ? h("span", { class: "ccpp-usage-rings" }, ring(five, t(L4.session)), ring(week, t(L4.weekly))) : null, style !== "rings" ? h("span", { class: "ccpp-usage-text", text }) : null);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      open(button);
    });
    return button;
  }
  var SLOT_CSS = `
.ccpp-usage { gap: 6px; font-variant-numeric: tabular-nums; }
.ccpp-usage-rings { display: inline-flex; gap: 3px; }
.ccpp-usage-ring { position: relative; width: 14px; height: 14px; border-radius: 50%; }
.ccpp-usage-ring::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--bg-000, #fff); }
html[data-mode="dark"] .ccpp-usage-ring::after { background: #30302e; }
.ccpp-usage.err { color: #d1453b; }
`;
  var PANEL_CSS = `
.metric { display: flex; flex-direction: column; gap: 4px; }
.metric .line { display: flex; justify-content: space-between; } .metric .pct { font-weight: 600; font-variant-numeric: tabular-nums; }
.bar { height: 6px; border-radius: 3px; background: var(--bg3); overflow: hidden; } .bar > i { display: block; height: 100%; border-radius: 3px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--fg3); }
.foot a { color: var(--accent); text-decoration: none; }
`;
  function metric(label, window2) {
    const lv = level(window2.utilization, settings2.store.warnAt, settings2.store.dangerAt);
    const reset = window2.resetsAt ? window2.resetsAt - Date.now() < 24 * 3600 * 1000 ? t(L4.resetsIn).replace("{t}", untilText(window2.resetsAt)) : t(L4.resetsAt).replace("{t}", dateTimeText(window2.resetsAt)) : "";
    return h("div", { class: "metric" }, h("div", { class: "line" }, h("span", { text: label }), h("span", { class: "pct", text: `${Math.round(window2.utilization)}%`, style: { color: COLORS[lv] } })), h("div", { class: "bar" }, h("i", { style: { width: `${window2.utilization}%`, background: COLORS[lv] } })), reset ? h("div", { class: "muted", text: reset, style: { fontSize: "12px" } }) : null);
  }
  function renderPanel(panel) {
    const refreshBtn = h("button", { type: "button", class: "icon-btn", title: t(L4.refresh), "aria-label": t(L4.refresh) }, icon("refresh", 15));
    if (loading)
      refreshBtn.firstElementChild?.classList.add("spin");
    refreshBtn.addEventListener("click", () => refresh(true));
    panel.appendChild(h("div", { class: "top" }, icon("gauge", 16), h("b", { text: t(L4.title) }), refreshBtn));
    if (error)
      panel.appendChild(h("div", { class: "msg bad", text: t(L4.error).replace("{e}", error) }));
    if (!usage && !error)
      panel.appendChild(h("div", { class: "msg", text: t(L4.loading) }));
    if (usage) {
      const rows = [
        usage.fiveHour && metric(t(L4.session), usage.fiveHour),
        usage.sevenDay && metric(t(L4.weekly), usage.sevenDay),
        ...usage.extra.map((e) => metric(`${t(L4.weekly)} · ${e.key}`, e.window))
      ].filter(Boolean);
      if (!rows.length)
        panel.appendChild(h("div", { class: "msg", text: t(L4.none) }));
      panel.append(...rows);
    }
    panel.appendChild(h("div", { class: "foot" }, h("span", { text: usage ? t(L4.updated).replace("{t}", agoText(usage.fetchedAt)) : "" }), h("a", { href: "/settings/usage", text: t(L4.open) })));
  }
  var usageDisplay_default = definePlugin({
    name: "UsageDisplay",
    title: { zh: "用量显示", en: "Usage display" },
    description: {
      zh: "在输入框模型选择器旁显示 5 小时会话与每周用量（双圆环 / 百分比），点开看重置时间。数据来自 claude.ai 自己的用量接口。",
      en: "Shows the 5-hour session and weekly usage next to the model picker (rings or percent); click for reset times. Data comes from claude.ai's own usage endpoint."
    },
    category: "usage",
    icon: "gauge",
    enabledByDefault: true,
    dependencies: ["ClaudeApi", "SlotsApi", "StylesApi", "ChatStateApi"],
    settings: settings2,
    start(scope) {
      addStyle(scope, SLOT_CSS, "usage");
      const panel = createPopover(scope, "usage-panel", PANEL_CSS);
      const open = (anchor) => {
        panel.open(anchor, renderPanel);
        refresh();
      };
      const item = addSlotItem(scope, "composer", "usage", () => chip(open), -10);
      const update = () => {
        refreshSlotItem(item);
        panel.update();
      };
      listeners2.add(update);
      scope.defer(() => listeners2.delete(update));
      scope.defer(() => inflight?.abort());
      scope.interval(() => refresh(), settings2.store.refreshSec * 1000);
      scope.listen(document, "visibilitychange", () => !document.hidden && Date.now() - lastAttempt > settings2.store.refreshSec * 1000 && refresh());
      scope.on("reply:end", () => scope.timeout(() => refresh(true), 2500));
      scope.interval(() => panel.update(), 60000);
      refresh(true);
    }
  });

  // src/plugins/chatNavigator/index.ts
  var logger8 = new Logger("ChatNavigator");
  var settings3 = definePluginSettings({
    showAssistant: { type: "boolean", label: { zh: "列出 Claude 的回复", en: "List Claude's replies" }, description: { zh: "关闭后只列出你的提问。", en: "Off lists only your prompts." }, default: true },
    minMessages: { type: "number", label: { zh: "至少几条消息才显示", en: "Show from this many messages" }, default: 3, min: 1, max: 20 },
    flash: { type: "boolean", label: { zh: "跳转后高亮目标消息", en: "Highlight the message after jumping" }, default: true },
    keys: { type: "boolean", label: { zh: "Alt + ↑ / ↓ 在消息间跳转", en: "Alt + ↑ / ↓ steps between messages" }, default: true }
  });
  var L5 = {
    you: { zh: "你", en: "You" },
    claude: "Claude",
    streaming: { zh: "（正在回复…）", en: "(replying…)" },
    empty: { zh: "（空消息）", en: "(empty)" },
    title: { zh: "对话目录", en: "Outline" }
  };
  var CSS4 = `
.rail { position: fixed; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-end; gap: var(--gap, 6px); padding: 10px 6px; pointer-events: auto; border-radius: 10px; max-height: 70vh; }
.tick { display: block; height: 2px; border-radius: 1px; background: var(--fg3); opacity: .45; border: 0; padding: 0; cursor: pointer; transition: width .12s, opacity .12s, background .12s; }
.tick.user { width: 16px; } .tick.assistant { width: 9px; }
.tick.current { opacity: 1; background: var(--fg); width: 20px; }
.tick.marked { background: #e8a33d; opacity: 1; }
.rail:hover .tick { opacity: .8; }
.list { position: fixed; top: 50%; transform: translateY(-50%); width: 300px; max-height: 70vh; overflow: auto; padding: 6px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: none; }
.list.show { display: block; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; transform: translate(6px, -50%); } }
.head { padding: 4px 8px 6px; font-weight: 600; color: var(--fg2); font-size: 12px; }
.row { display: flex; gap: 8px; width: 100%; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; align-items: baseline; }
.row:hover { background: var(--bg2); } .row.current { background: var(--bg3); }
.row .who { flex: none; width: 44px; font-size: 11px; color: var(--fg3); } .row.user .who { color: var(--accent); }
.row .txt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row.assistant .txt { color: var(--fg2); }
.row .star { color: #e8a33d; flex: none; }
`;
  var chatNavigator_default = definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
      zh: "对话右侧的刻度目录：悬停展开全部提问与回复（包括长对话里尚未渲染的部分），点击跳转；Alt+↑/↓ 逐条跳转；收藏的消息标成橙色。",
      en: "A tick outline on the right of the chat: hover to list every prompt and reply (also ones not rendered yet in long chats), click to jump, Alt+↑/↓ to step; starred messages show in orange."
    },
    category: "messages",
    icon: "list",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "RouterApi", "HotkeysApi"],
    settings: settings3,
    start(scope) {
      const { box } = createHost(scope, "navigator", CSS4);
      const rail = h("nav", { class: "rail", "aria-label": t(L5.title) });
      const list = h("div", { class: "list", role: "menu", "aria-label": t(L5.title) });
      box.append(rail, list);
      let items = [];
      let chatId = null;
      let current = null;
      let loadToken = 0;
      let hideTimer;
      const shown = () => settings3.store.showAssistant ? items : items.filter((i) => i.role === "user");
      const fromDom = () => {
        const total = totalMessages() ?? 0;
        const rows = new Map(getRows().map((r) => [r.index, r]));
        return Array.from({ length: total }, (_, index) => {
          const row = rows.get(index);
          const role = row?.role ?? (index % 2 === 0 ? "user" : "assistant");
          return { index, role, text: row?.el.innerText ?? "" };
        });
      };
      const load = async (force = false) => {
        const token = ++loadToken;
        if (!chatId) {
          items = [];
          draw();
          return;
        }
        try {
          const conversation = await loadConversation(chatId, force);
          if (token !== loadToken || !conversation)
            return;
          items = conversation.messages.map((m, index) => ({ index, role: m.role, text: m.text }));
        } catch (error) {
          logger8.warn("Falling back to the page for the outline:", error);
          if (token !== loadToken)
            return;
          items = fromDom();
        }
        const total = totalMessages();
        if (total && total > items.length)
          items = [...items, ...fromDom().slice(items.length)];
        draw();
      };
      const place = () => {
        const scroller = getScroller();
        const visible = !!scroller && !!chatId && shown().length >= settings3.store.minMessages;
        rail.style.display = visible ? "" : "none";
        if (!visible) {
          list.classList.remove("show");
          return;
        }
        const rect = scroller.getBoundingClientRect();
        const right = Math.max(4, window.innerWidth - rect.right + 14);
        rail.style.right = `${right}px`;
        list.style.right = `${right + 30}px`;
      };
      const draw = () => {
        clear(rail);
        const entries = shown();
        const stars = getMarks("stars");
        const gap = entries.length > 60 ? 2 : entries.length > 30 ? 4 : 7;
        rail.style.setProperty("--gap", `${gap}px`);
        for (const item of entries) {
          const tick = h("button", { type: "button", class: `tick ${item.role}${item.index === current ? " current" : ""}${stars.has(item.index) ? " marked" : ""}`, "aria-label": `${item.role === "user" ? t(L5.you) : L5.claude}: ${snippet(item.text, 60)}` });
          tick.addEventListener("click", () => go(item.index));
          rail.appendChild(tick);
        }
        if (list.classList.contains("show"))
          drawList();
        place();
      };
      const drawList = () => {
        clear(list);
        const stars = getMarks("stars");
        list.appendChild(h("div", { class: "head", text: `${t(L5.title)} · ${shown().length}` }));
        for (const item of shown()) {
          const text = item.text.trim() ? snippet(item.text, 90) : item.role === "assistant" && item.index === items.length - 1 ? t(L5.streaming) : t(L5.empty);
          const row = h("button", { type: "button", role: "menuitem", class: `row ${item.role}${item.index === current ? " current" : ""}` }, h("span", { class: "who", text: item.role === "user" ? t(L5.you) : L5.claude }), h("span", { class: "txt", text }), stars.has(item.index) ? h("span", { class: "star", text: "★" }) : null);
          row.addEventListener("click", () => go(item.index));
          list.appendChild(row);
        }
        list.querySelector(".row.current")?.scrollIntoView({ block: "nearest" });
      };
      const go = (index) => {
        current = index;
        draw();
        jumpTo(index, { flash: settings3.store.flash });
      };
      const showList = () => {
        clearTimeout(hideTimer);
        if (!list.classList.contains("show")) {
          list.classList.add("show");
          drawList();
        }
      };
      const hideList = () => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => list.classList.remove("show"), 250);
      };
      for (const el of [rail, list]) {
        el.addEventListener("mouseenter", showList);
        el.addEventListener("mouseleave", hideList);
      }
      scope.defer(() => clearTimeout(hideTimer));
      const syncCurrent = () => {
        const next = currentIndex();
        if (next === current)
          return;
        current = next;
        for (const tick of rail.children)
          tick.classList.remove("current");
        const index = shown().findIndex((item) => item.index === current);
        rail.children[index]?.classList.add("current");
        if (list.classList.contains("show"))
          drawList();
      };
      let scrollQueued = false;
      scope.listen(document, "scroll", () => {
        if (scrollQueued)
          return;
        scrollQueued = true;
        requestAnimationFrame(() => {
          scrollQueued = false;
          syncCurrent();
        });
      }, { capture: true, passive: true });
      scope.listen(window, "resize", place);
      onRoute(scope, (route) => {
        chatId = route.chatId;
        current = null;
        items = [];
        draw();
        if (chatId)
          scope.timeout(() => load(), 300);
      });
      scope.on("reply:end", () => scope.timeout(() => load(true), 800));
      onMarksChange(scope, draw);
      scope.interval(() => {
        place();
        const total = totalMessages();
        if (chatId && total && total !== items.length)
          load(total > items.length);
        syncCurrent();
      }, 1200);
      if (settings3.store.keys) {
        const step = (dir) => {
          const entries = shown();
          if (!entries.length)
            return;
          const at = current ?? currentIndex() ?? 0;
          const target = dir > 0 ? entries.find((i) => i.index > at) : [...entries].reverse().find((i) => i.index < at);
          if (target)
            go(target.index);
        };
        bindKey(scope, "alt+arrowdown", () => step(1), { inInputs: false });
        bindKey(scope, "alt+arrowup", () => step(-1), { inInputs: false });
      }
    }
  });

  // src/plugins/messageStars/store.ts
  var isStar = (v) => v && typeof v.key === "string" && Number.isInteger(v.index) && (v.role === "user" || v.role === "assistant") && typeof v.text === "string" && typeof v.at === "number";
  function isBook(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    return Object.values(value).every((chat) => chat && typeof chat.title === "string" && Array.isArray(chat.stars) && chat.stars.every(isStar));
  }
  var book = persisted("message-stars", {}, isBook);
  var starsFor = (chatId) => chatId ? book.get()[chatId]?.stars ?? [] : [];
  function toggleStar(chatId, title, star, current = book.get()) {
    const chat = current[chatId] ?? { title, stars: [] };
    const exists = chat.stars.some((s) => s.key === star.key);
    const stars = exists ? chat.stars.filter((s) => s.key !== star.key) : [...chat.stars, star].sort((a, b) => a.index - b.index);
    const next = { ...current };
    if (stars.length)
      next[chatId] = { title: title || chat.title, stars };
    else
      delete next[chatId];
    return { next, starred: !exists };
  }

  // src/plugins/messageStars/index.ts
  var settings4 = definePluginSettings({
    headerButton: { type: "boolean", label: { zh: "在对话标题栏显示收藏列表按钮", en: "Starred list button in the chat header" }, default: true },
    otherChats: { type: "boolean", label: { zh: "列表里同时显示其它对话的收藏", en: "Also list stars from other chats" }, default: true }
  });
  var L6 = {
    star: { zh: "收藏这条消息", en: "Star this message" },
    unstar: { zh: "取消收藏", en: "Unstar" },
    list: { zh: "收藏的消息", en: "Starred messages" },
    here: { zh: "本对话", en: "This chat" },
    others: { zh: "其它对话", en: "Other chats" },
    none: { zh: "还没有收藏。悬停消息，点操作栏里的 ☆。", en: "Nothing starred yet. Hover a message and click ☆ in its action bar." },
    you: { zh: "你", en: "You" }
  };
  var CSS5 = `
.ccpp-star-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: inherit; cursor: pointer; opacity: .7; }
.ccpp-star-btn:hover { opacity: 1; background: rgba(127,127,127,.14); }
.ccpp-star-btn.on { color: #e8a33d; opacity: 1; }
.ccpp-star-btn.on svg { fill: currentColor; }
.ccpp-star-float { position: absolute; top: 4px; inset-inline-start: -34px; opacity: 0; transition: opacity .12s; z-index: 1; }
[data-testid="transcript-row"]:hover .ccpp-star-float, .ccpp-star-float.on { opacity: .8; }
.ccpp-starred-row [data-testid="user-message"], .ccpp-starred-row [data-testid="assistant-message"] { box-shadow: inset 3px 0 0 #e8a33d; border-radius: 4px; }
`;
  var LIST_CSS = `.sec { font-size: 12px; color: var(--fg3); padding: 2px 8px; } .star { color: #e8a33d; flex: none; }`;
  function rowInfo(row) {
    const index = Number(row.dataset.index);
    const message = row.querySelector(`${SEL.userMessage}, ${SEL.assistantMessage}`);
    if (!Number.isFinite(index) || !message)
      return null;
    const role = message.matches(SEL.userMessage) ? "user" : "assistant";
    const keyed = row.querySelector("[data-turn-key]");
    const key = keyed?.dataset.turnKey ? `${keyed.dataset.turnKey}:${role}` : `i${index}`;
    const body = role === "user" ? message.querySelector(SEL.userMessageBody) ?? message : message.querySelector(SEL.prose) ?? message;
    return { index, role, key, text: snippet(body.innerText, 200) };
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
    settings: settings4,
    start(scope) {
      addStyle(scope, CSS5, "stars");
      const isStarred = (key) => starsFor(currentRoute().chatId).some((s) => s.key === key);
      const toggle = (row) => {
        const chatId = currentRoute().chatId;
        const info = rowInfo(row);
        if (!chatId || !info)
          return;
        const { next } = toggleStar(chatId, chatTitle(), { ...info, at: Date.now() });
        book.set(next);
      };
      const paint = () => {
        const chatId = currentRoute().chatId;
        const keys = new Set(starsFor(chatId).map((s) => s.key));
        for (const row of document.querySelectorAll(SEL.transcriptRow)) {
          const info = rowInfo(row);
          const on = !!info && keys.has(info.key);
          row.classList.toggle("ccpp-starred-row", on);
          for (const btn of row.querySelectorAll(".ccpp-star-btn")) {
            btn.classList.toggle("on", on);
            btn.title = t(on ? L6.unstar : L6.star);
            btn.setAttribute("aria-pressed", String(on));
          }
        }
        setMarks("stars", starsFor(chatId).map((s) => s.index));
      };
      const makeButton = (row, extra = "") => {
        const info = rowInfo(row);
        const on = !!info && isStarred(info.key);
        const btn = h("button", { type: "button", class: `ccpp-star-btn${extra}${on ? " on" : ""}`, title: t(on ? L6.unstar : L6.star), "aria-label": t(L6.star), "aria-pressed": String(on) }, icon("star", 15));
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle(row);
        });
        return btn;
      };
      watch(scope, SEL.transcriptRow, (row) => {
        let btn = null;
        const attach = () => {
          if (btn?.isConnected)
            return;
          const toolbar = row.querySelector(SEL.messageActions) ?? row.querySelector('[role="toolbar"]');
          if (toolbar) {
            btn = makeButton(row);
            toolbar.appendChild(btn);
            return;
          }
          const message = row.querySelector(SEL.userMessage);
          if (!message)
            return;
          const holder = message.parentElement ?? message;
          if (getComputedStyle(holder).position === "static")
            holder.style.position = "relative";
          btn = makeButton(row, " ccpp-star-float");
          holder.appendChild(btn);
        };
        attach();
        const observer = new MutationObserver(() => attach());
        observer.observe(row, { childList: true, subtree: true });
        row.classList.toggle("ccpp-starred-row", (() => {
          const info = rowInfo(row);
          return !!info && isStarred(info.key);
        })());
        return () => {
          observer.disconnect();
          btn?.remove();
          row.classList.remove("ccpp-starred-row");
        };
      });
      const list = createPopover(scope, "stars-list", LIST_CSS, 340);
      const renderList = (panel, close) => {
        const chatId = currentRoute().chatId;
        const here = starsFor(chatId);
        panel.appendChild(h("div", { class: "top" }, icon("star", 16), h("b", { text: t(L6.list) })));
        const item = (star, onClick, sub) => {
          const row = h("button", { type: "button", class: "item" }, h("span", { class: "star", text: "★" }), h("span", { class: "grow" }, h("div", { class: "clip2", text: star.text || "…" }), h("div", { class: "sub", text: sub })));
          row.addEventListener("click", onClick);
          return row;
        };
        if (here.length) {
          panel.appendChild(h("div", { class: "sec", text: t(L6.here) }));
          for (const star of here)
            panel.appendChild(item(star, () => (close(), void jumpTo(star.index)), `${star.role === "user" ? t(L6.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}`));
        }
        const others = settings4.store.otherChats ? Object.entries(book.get()).filter(([id]) => id !== chatId) : [];
        if (others.length) {
          panel.appendChild(h("div", { class: "sec", text: t(L6.others) }));
          for (const [id, chat] of others.slice(0, 30)) {
            for (const star of chat.stars.slice(0, 5)) {
              panel.appendChild(item(star, () => {
                close();
                location.assign(`/chat/${id}`);
              }, `${chat.title || id.slice(0, 8)} · #${star.index + 1}`));
            }
          }
        }
        if (!here.length && !others.length)
          panel.appendChild(h("div", { class: "msg", text: t(L6.none) }));
      };
      let headerItem = null;
      if (settings4.store.headerButton) {
        headerItem = addSlotItem(scope, "header", "stars", () => {
          const count = starsFor(currentRoute().chatId).length;
          const btn = slotButton(t(L6.list), (event) => list.open(event.currentTarget, renderList), icon("star", 16), count ? String(count) : "");
          if (count)
            btn.classList.add("on");
          return btn;
        }, 10);
      }
      scope.defer(book.subscribe(() => {
        paint();
        if (headerItem)
          refreshSlotItem(headerItem);
        list.update();
      }));
      scope.defer(() => setMarks("stars", []));
      onRoute(scope, () => {
        paint();
        if (headerItem)
          refreshSlotItem(headerItem);
        list.close();
      });
      paint();
    }
  });

  // src/plugins/projectStatus/index.ts
  var logger9 = new Logger("ProjectStatus");
  var settings5 = definePluginSettings({
    showCode: { type: "boolean", label: { zh: "图标右上角显示项目自身的 Code 状态", en: "Show the project's own Code session on the icon corner" }, description: { zh: "右侧圆点是项目里线程（对话）的状态；图标右上角是项目总控 Code 会话的状态，和原生会话图标的角标位置一致。", en: "The dot on the right is for the project's threads; the icon corner is for the project's own Code session, like the native session icons." }, default: true },
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    refreshSec: { type: "number", label: { zh: "刷新间隔", en: "Refresh every" }, default: 15, min: 5, max: 120, step: 5, unit: "s" }
  });
  var L7 = {
    running: { zh: "运行中", en: "Running" },
    waiting: { zh: "等你回复", en: "Waiting for you" }
  };
  var PROJECT_ROW = '[data-group-list^="chan_"]';
  var ROW = "[data-row]";
  var ICON_HOLDER = ".df-leading-slot .relative, [data-leading-slot] .relative";
  var NATIVE_STATUS = '[data-row-decoration]:not([data-ccpp-status]) [role="status"]';
  var CSS6 = `
[data-ccpp-corner] { position: absolute; top: -1px; inset-inline-end: -2px; display: flex; pointer-events: none; }
[data-ccpp-corner] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; box-shadow: 0 0 0 1.5px var(--cds-surface-1, var(--df-bg, #1f1e1d)); }
[data-ccpp-corner] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-corner] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
[data-ccpp-status] { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; pointer-events: none; transition: opacity .12s; }
[data-row]:hover > [data-ccpp-status], [data-row]:focus-within > [data-ccpp-status] { opacity: 0; }
/* Keep long project names clear of the dot (the label fades out at its end). */
[data-row]:has(> [data-ccpp-status]) [data-row-label] { padding-inline-end: 22px; }
[data-row]:has(> [data-ccpp-status]):hover [data-row-label] { padding-inline-end: 0; }
[data-ccpp-status] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; }
[data-ccpp-status] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-status] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-status] .status-dot { animation: none !important; } }
`;
  function cornerKind(activity, showWaiting) {
    if (activity?.own === "working")
      return "clay";
    if (showWaiting && activity?.own === "blocked")
      return "awaiting";
    return null;
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
      zh: "claude.ai 侧栏只给当前选中的项目显示运行中的呼吸圆点；本插件为所有项目显示。右侧圆点是线程状态（在跑就呼吸，等你回复是黄点），图标右上角是项目自身 Code 会话的状态。",
      en: "claude.ai only shows the breathing running dot on the selected project; this shows it on every project in the sidebar (breathing while a thread runs, yellow when one waits for you)."
    },
    category: "chats",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["ClaudeApi", "DomApi", "StylesApi"],
    settings: settings5,
    start(scope) {
      addStyle(scope, CSS6, "project-status");
      const activity = new Map;
      const rows = new Map;
      let busy = false;
      const paint = (id) => {
        const group = rows.get(id);
        const row = group?.querySelector(ROW);
        if (!row)
          return;
        const info = activity.get(id);
        const kind = row.querySelector(NATIVE_STATUS) ? null : dotKind(info, settings5.store.showWaiting);
        place(row, ":scope > [data-ccpp-status]", kind, "data-ccpp-status", () => row);
        const holder = row.querySelector(ICON_HOLDER);
        const nativeCorner = holder?.querySelector(".status-dot:not([data-ccpp-corner] *), [aria-hidden] > .status-dot:not([data-ccpp-corner] *)");
        const corner = settings5.store.showCode && holder && !nativeCorner ? cornerKind(info, settings5.store.showWaiting) : null;
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
        const label = t(kind === "clay" ? L7.running : L7.waiting);
        target.appendChild(h("span", { [attr]: kind, title: label }, h("span", { role: "status", "aria-label": label }, h("span", { class: "status-dot", "data-kind": kind }))));
      };
      const poll = async () => {
        if (busy || document.hidden || !rows.size)
          return;
        busy = true;
        try {
          const results = await Promise.allSettled([...rows.keys()].map((id) => getProjectActivity(id, scope.signal)));
          if (!scope.alive)
            return;
          for (const result of results) {
            if (result.status === "fulfilled")
              activity.set(result.value.channelId, result.value);
            else
              logger9.debug("Project activity failed:", result.reason);
          }
          for (const id of rows.keys())
            paint(id);
        } finally {
          busy = false;
        }
      };
      let pollSoon;
      watch(scope, PROJECT_ROW, (group) => {
        const id = group.dataset.groupList;
        rows.set(id, group);
        paint(id);
        clearTimeout(pollSoon);
        pollSoon = setTimeout(poll, 300);
        const observer = new MutationObserver(() => paint(id));
        observer.observe(group, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          if (rows.get(id) === group)
            rows.delete(id);
          group.querySelector("[data-ccpp-status]")?.remove();
          group.querySelector("[data-ccpp-corner]")?.remove();
        };
      });
      scope.defer(() => clearTimeout(pollSoon));
      scope.interval(poll, settings5.store.refreshSec * 1000);
      scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    }
  });

  // src/plugins/inputHistory/index.ts
  var settings6 = definePluginSettings({
    max: { type: "number", label: { zh: "最多保存几条", en: "Prompts to keep" }, default: 100, min: 10, max: 1000, step: 10 },
    button: { type: "boolean", label: { zh: "在输入框旁显示历史按钮", en: "History button next to the model picker" }, default: false },
    clear: { type: "action", label: { zh: "清空历史", en: "Clear history" }, button: { zh: "清空", en: "Clear" }, confirm: { zh: "清空全部输入历史？", en: "Clear all prompt history?" }, run: () => history.set([]) }
  });
  var L8 = {
    title: { zh: "输入历史", en: "Prompt history" },
    empty: { zh: "还没有历史。发送过的提问会出现在这里。", en: "No history yet. Prompts you send show up here." },
    hint: { zh: "在空输入框里按 ↑ / ↓ 翻阅，Esc 恢复草稿", en: "↑ / ↓ in the input to browse, Esc restores your draft" }
  };
  var history = persisted("input-history", [], (v) => Array.isArray(v) && v.every((x) => typeof x === "string"));
  function remember(list, text, max) {
    const clean = text.trim();
    if (!clean)
      return list;
    return [clean, ...list.filter((item) => item !== clean)].slice(0, max);
  }
  function caretAtEdge(editor, edge) {
    const selection = getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed)
      return false;
    const range = selection.getRangeAt(0);
    const caret = range.getClientRects()[0] ?? range.startContainer.getBoundingClientRect?.();
    const box = editor.getBoundingClientRect();
    if (!caret)
      return true;
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
    return edge === "start" ? caret.top - box.top < lineHeight * 1.2 : box.bottom - caret.bottom < lineHeight * 1.2;
  }
  var inputHistory_default = definePlugin({
    name: "InputHistory",
    title: { zh: "输入历史", en: "Input history" },
    description: {
      zh: "像终端一样用 ↑ / ↓ 调出之前发送过的提问，Esc 恢复草稿；可选在输入框旁显示历史列表。",
      en: "Recall earlier prompts with ↑ / ↓ like a shell; Esc restores the draft. Optional history list next to the model picker."
    },
    category: "composer",
    icon: "history",
    enabledByDefault: true,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings: settings6,
    start(scope) {
      let cursor = -1;
      let draft = "";
      let applied = "";
      onSubmit(scope, (text) => {
        history.set(remember(history.get(), text, settings6.store.max));
        cursor = -1;
        draft = "";
      });
      const show = (text) => {
        applied = text;
        setText(text);
        requestAnimationFrame(() => caretToEnd());
      };
      scope.listen(document, "keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing)
          return;
        const editor = event.target?.closest?.(SEL.editor);
        if (!editor)
          return;
        const list = history.get();
        const current = getText(editor);
        if (cursor >= 0 && current !== applied)
          cursor = -1;
        if (event.key === "ArrowUp") {
          if (!list.length || current && cursor < 0 || !caretAtEdge(editor, "start"))
            return;
          if (cursor >= list.length - 1)
            return;
          if (cursor < 0)
            draft = current;
          cursor++;
        } else if (event.key === "ArrowDown") {
          if (cursor < 0 || !caretAtEdge(editor, "end"))
            return;
          cursor--;
          if (cursor < 0) {
            event.preventDefault();
            event.stopPropagation();
            show(draft);
            return;
          }
        } else if (event.key === "Escape") {
          if (cursor < 0)
            return;
          cursor = -1;
          event.preventDefault();
          event.stopPropagation();
          show(draft);
          return;
        } else
          return;
        event.preventDefault();
        event.stopPropagation();
        show(list[cursor]);
      }, { capture: true });
      if (settings6.store.button) {
        const popover = createPopover(scope, "input-history", "", 360);
        addSlotItem(scope, "composer", "input-history", () => slotButton(t(L8.title), (event) => popover.open(event.currentTarget, (panel, close) => {
          panel.appendChild(h("div", { class: "top" }, icon("history", 16), h("b", { text: t(L8.title) })));
          panel.appendChild(h("div", { class: "msg", text: t(L8.hint), style: { fontSize: "12px" } }));
          const list = history.get();
          if (!list.length)
            panel.appendChild(h("div", { class: "msg", text: t(L8.empty) }));
          for (const text of list.slice(0, 50)) {
            const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow clip2", text: snippet(text, 200) }));
            item.addEventListener("click", () => {
              close();
              getEditor()?.focus();
              show(text);
            });
            panel.appendChild(item);
          }
        }), icon("history", 16)), 20);
      }
    }
  });

  // src/plugins/promptPresets/index.ts
  var settings7 = definePluginSettings({
    presets: {
      type: "text",
      label: { zh: "预设", en: "Presets" },
      description: { zh: "每段一个预设，段与段之间空一行；第一行是标题。正文里的 \\n 会换行。", en: "One preset per block, blocks separated by a blank line; the first line is the title." },
      rows: 10,
      default: `翻译成中文
把下面的内容翻译成自然流畅的中文：

逐行解释代码
逐行解释下面的代码，指出潜在问题：

总结要点
用 5 条以内的要点总结：`
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
  var L9 = {
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
    title: L9.title,
    description: { zh: "输入框旁的预设按钮，一键插入常用提示词。", en: "A button next to the model picker that inserts saved prompts." },
    category: "composer",
    icon: "fileText",
    enabledByDefault: false,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings: settings7,
    start(scope) {
      const popover = createPopover(scope, "presets", "", 320);
      addSlotItem(scope, "composer", "presets", () => slotButton(t(L9.title), (event) => popover.open(event.currentTarget, (panel, close) => {
        panel.appendChild(h("div", { class: "top" }, icon("fileText", 16), h("b", { text: t(L9.title) })));
        const presets = parsePresets(settings7.store.presets);
        if (!presets.length)
          panel.appendChild(h("div", { class: "msg", text: t(L9.empty) }));
        for (const preset of presets) {
          const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow" }, h("div", { class: "clip", text: preset.title, style: { fontWeight: "600" } }), h("div", { class: "sub clip", text: snippet(preset.body, 80) })));
          item.addEventListener("click", () => {
            close();
            const editor = getEditor();
            if (!editor)
              return;
            if (settings7.store.mode === "replace")
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
  var settings8 = definePluginSettings({
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
    desktop: { type: "boolean", label: { zh: "系统通知", en: "Desktop notification" }, description: { zh: "首次需要浏览器授权；点通知回到该对话。", en: "Needs browser permission once; clicking it returns to the chat." }, default: true },
    toast: { type: "boolean", label: { zh: "页面内提示条", en: "In-page toast" }, default: true },
    test: { type: "action", label: { zh: "试一下", en: "Try it" }, button: { zh: "发送测试提醒", en: "Send a test" }, run: () => notify2({ chatId: currentRoute().chatId, title: "CC++", durationMs: 0, at: Date.now() }, true) }
  });
  var L10 = {
    done: { zh: "Claude 回复完成", en: "Claude finished replying" },
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
  function notify2(event, test = false) {
    const body = [event.title, event.durationMs ? t(L10.took).replace("{s}", String(Math.round(event.durationMs / 1000))) : ""].filter(Boolean).join(" · ");
    const back = () => {
      window.focus();
      if (event.chatId && currentRoute().chatId !== event.chatId)
        location.assign(`/chat/${event.chatId}`);
    };
    if (settings8.store.sound)
      chime(settings8.store.volume);
    if (settings8.store.toast)
      toast(body, { title: t(L10.done), kind: "ok", onClick: back, key: "reply-done" });
    if (settings8.store.desktop && "Notification" in window) {
      const show = () => {
        try {
          const n = new Notification(t(L10.done), { body: `${body}
${t(L10.open)}`, tag: `ccpp-${event.chatId ?? "reply"}`, silent: true });
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
    dependencies: ["ChatStateApi", "NoticesApi", "RouterApi"],
    settings: settings8,
    start(scope) {
      scope.on("reply:end", (event) => {
        if (event.durationMs < settings8.store.minSeconds * 1000)
          return;
        if (settings8.store.when === "hidden" && !document.hidden && document.hasFocus())
          return;
        notify2(event);
      });
      if (settings8.store.desktop && "Notification" in window && Notification.permission === "default") {
        scope.listen(document, "pointerdown", () => void Notification.requestPermission(), { once: true });
      }
    }
  });

  // src/plugins/tabStatus/index.ts
  var settings9 = definePluginSettings({
    working: { type: "string", label: { zh: "回复中的标题前缀", en: "Title prefix while replying" }, default: "⏳", maxLength: 8 },
    done: { type: "string", label: { zh: "后台完成后的前缀", en: "Prefix after finishing in the background" }, description: { zh: "回到标签页后自动清除。", en: "Cleared when you come back to the tab." }, default: "✅", maxLength: 8 }
  });
  function withPrefix(title, prefix, known) {
    let base = title;
    for (const p of known)
      if (p && base.startsWith(`${p} `))
        base = base.slice(p.length + 1);
    return prefix ? `${prefix} ${base}` : base;
  }
  var tabStatus_default = definePlugin({
    name: "TabStatus",
    title: { zh: "标签页状态", en: "Tab status" },
    description: { zh: "在标签页标题前显示 ⏳（正在回复）/ ✅（后台已完成），多开标签时一眼看出哪个好了。", en: "Prefixes the tab title with ⏳ while replying and ✅ when done in the background." },
    category: "notifications",
    icon: "tab",
    enabledByDefault: true,
    dependencies: ["ChatStateApi"],
    settings: settings9,
    start(scope) {
      let state = chatPhase() === "streaming" ? "working" : "idle";
      const prefixes = () => [settings9.store.working, settings9.store.done];
      const apply = () => {
        const prefix = state === "working" ? settings9.store.working : state === "done" ? settings9.store.done : "";
        const next = withPrefix(document.title, prefix, prefixes());
        if (next !== document.title)
          document.title = next;
      };
      scope.on("reply:start", () => {
        state = "working";
        apply();
      });
      scope.on("reply:end", () => {
        state = document.hidden ? "done" : "idle";
        apply();
      });
      scope.listen(document, "visibilitychange", () => {
        if (!document.hidden && state === "done") {
          state = "idle";
          apply();
        }
      });
      const titleEl = () => document.querySelector("title");
      let observed = null;
      const observer = new MutationObserver(apply);
      scope.interval(() => {
        const el = titleEl();
        if (el && el !== observed) {
          observer.disconnect();
          observer.observe(el, { childList: true, characterData: true, subtree: true });
          observed = el;
        }
      }, 1000);
      scope.defer(() => {
        observer.disconnect();
        state = "idle";
        document.title = withPrefix(document.title, "", prefixes());
      });
      apply();
    }
  });

  // src/plugins/widerChat/index.ts
  var settings10 = definePluginSettings({
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
    settings: settings10,
    start(scope) {
      const set = addStyle(scope, widerCss(settings10.store.width, settings10.store.composer), "wider-chat");
      this.onSettingsChange = () => set(widerCss(settings10.store.width, settings10.store.composer));
    }
  });

  // src/plugins/composerLook/index.ts
  var settings11 = definePluginSettings({
    opacity: { type: "number", label: { zh: "输入框背景不透明度", en: "Input background opacity" }, description: { zh: "100 为完全不透明。", en: "100 is fully opaque." }, default: 85, min: 20, max: 100, step: 5, unit: "%" },
    blur: { type: "number", label: { zh: "背景模糊", en: "Background blur" }, default: 12, min: 0, max: 40, unit: "px" },
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
    category: "appearance",
    icon: "blend",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings: settings11,
    start(scope) {
      const css = () => composerCss(settings11.store.opacity, settings11.store.blur, settings11.store.radius);
      const set = addStyle(scope, css(), "composer-look");
      this.onSettingsChange = () => set(css());
    }
  });

  // src/plugins/customGreeting/index.ts
  var settings12 = definePluginSettings({
    phrases: {
      type: "text",
      label: { zh: "问候语（每行一条）", en: "Greetings (one per line)" },
      description: { zh: "{name} 会替换成你的显示名，{time} 替换成早上好 / 下午好 / 晚上好。", en: "{name} becomes your display name, {time} becomes morning / afternoon / evening." },
      rows: 5,
      default: `{time}，{name}
今天想做点什么？
灵感来了就写下来`
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
    placeholder: { type: "string", label: { zh: "输入框占位文字", en: "Input placeholder" }, description: { zh: "留空保持官方文字。", en: "Empty keeps claude.ai's text." }, default: "" }
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
  var displayName = () => document.querySelector(`${SEL.userMenuButton} [data-cds="Avatar"]`)?.getAttribute("aria-label")?.trim() || document.querySelector(`${SEL.userMenuName} span`)?.textContent?.trim() || "";
  var customGreeting_default = definePlugin({
    name: "CustomGreeting",
    title: { zh: "自定义问候语", en: "Custom greeting" },
    description: { zh: "替换新对话首页的问候语，支持多条随机 / 依次轮换（打开时、点击或定时），也可改输入框占位文字。", en: "Replaces the new-chat greeting with your own lines, rotated on visit, click or a timer; can also change the input placeholder." },
    category: "appearance",
    icon: "message",
    enabledByDefault: false,
    dependencies: ["DomApi", "RouterApi"],
    settings: settings12,
    start(scope) {
      const phrases = () => settings12.store.phrases.split(`
`).map((s) => s.trim()).filter(Boolean);
      let text = "";
      const next = () => {
        const pick = pickPhrase(phrases(), settings12.store.order, position.get());
        if (pick.index >= 0)
          position.set(pick.index);
        text = fillPhrase(pick.text, displayName(), new Date().getHours(), /[一-龥]/.test(pick.text));
      };
      const paint = () => {
        for (const el of document.querySelectorAll(SEL.greeting)) {
          if (text && el.textContent !== text)
            el.textContent = text;
        }
        const placeholder = settings12.store.placeholder.trim();
        if (placeholder) {
          for (const p of document.querySelectorAll(`${SEL.editor} p[data-placeholder]`)) {
            if (p.dataset.placeholder !== placeholder)
              p.dataset.placeholder = placeholder;
          }
        }
      };
      next();
      onRoute(scope, (route) => {
        if (route.kind === "new" && settings12.store.rotate === "visit")
          next();
        paint();
      }, false);
      watch(scope, SEL.greeting, (el) => {
        paint();
        const observer = new MutationObserver(paint);
        observer.observe(el, { childList: true, characterData: true, subtree: true });
        const onClick = () => {
          if (settings12.store.rotate !== "click")
            return;
          next();
          paint();
        };
        el.style.cursor = settings12.store.rotate === "click" ? "pointer" : "";
        el.addEventListener("click", onClick);
        return () => {
          observer.disconnect();
          el.removeEventListener("click", onClick);
        };
      });
      if (settings12.store.placeholder.trim())
        watch(scope, `${SEL.editor} p[data-placeholder]`, (p) => {
          paint();
          const observer = new MutationObserver(paint);
          observer.observe(p, { attributes: true, attributeFilter: ["data-placeholder"] });
          return () => observer.disconnect();
        });
      if (settings12.store.rotate === "timer")
        scope.interval(() => {
          next();
          paint();
        }, settings12.store.intervalSec * 1000);
    }
  });

  // src/plugins/cleaner/index.ts
  var settings13 = definePluginSettings({
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
    settings: settings13,
    start(scope) {
      addStyle(scope, cleanerCss(settings13.store), "cleaner");
      if (settings13.store.upgrade) {
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
    icon: "linkOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    start(scope) {
      addStyle(scope, `[data-testid="wiggle-controls-actions-share"] { display: none !important; }`, "no-share");
    }
  });

  // src/plugins/noDictation/index.ts
  var settings14 = definePluginSettings({
    dictation: { type: "boolean", label: { zh: "隐藏听写按钮", en: "Hide dictation" }, default: true },
    voice: { type: "boolean", label: { zh: "隐藏语音模式按钮", en: "Hide voice mode" }, default: true }
  });
  function noDictationCss(dictation, voice) {
    const selectors = [
      ...dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]'] : [],
      ...voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]'] : []
    ];
    return selectors.length ? `${selectors.map((s) => `[data-cds="ChatComposer"] ${s}`).join(`,
`)} { display: none !important; }` : "";
  }
  var noDictation_default = definePlugin({
    name: "NoDictation",
    title: { zh: "隐藏语音按钮", en: "No voice buttons" },
    description: { zh: "隐藏输入框里的听写 / 语音模式按钮。", en: "Hides the dictation and voice-mode buttons in the chat input." },
    category: "declutter",
    icon: "micOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings: settings14,
    start(scope) {
      addStyle(scope, noDictationCss(settings14.store.dictation, settings14.store.voice), "no-dictation");
    }
  });

  // src/plugins/streamerMode/index.ts
  var settings15 = definePluginSettings({
    identity: { type: "boolean", label: { zh: "模糊你的名字、头像与套餐", en: "Blur your name, avatar and plan" }, default: true },
    sidebar: { type: "boolean", label: { zh: "模糊侧栏的对话 / 项目标题", en: "Blur chat and project titles in the sidebar" }, default: true },
    title: { type: "boolean", label: { zh: "模糊当前对话标题", en: "Blur the current chat title" }, default: false },
    hover: { type: "boolean", label: { zh: "悬停时显示", en: "Reveal on hover" }, default: true },
    amount: { type: "number", label: { zh: "模糊程度", en: "Blur amount" }, default: 6, min: 2, max: 16, unit: "px" }
  });
  function streamerCss(o) {
    const targets = [
      ...o.identity ? ['[data-testid="user-menu-button"] .df-user-menu-trailing', '[data-testid="user-menu-button"] [data-cds="Avatar"]', "[data-new-page-greeting-text]"] : [],
      ...o.sidebar ? ['[data-testid="sidebar"] [data-row-label]', '[data-testid="sidebar"] a[href^="/chat/"]'] : [],
      ...o.title ? ['[data-testid="session-title-split"]'] : []
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
    settings: settings15,
    start(scope) {
      const set = addStyle(scope, streamerCss(settings15.store), "streamer");
      this.onSettingsChange = () => set(streamerCss(settings15.store));
    }
  });

  // src/plugins/recentChats/index.ts
  var settings16 = definePluginSettings({
    hotkey: { type: "string", label: { zh: "快捷键", en: "Shortcut" }, default: "ctrl+`" },
    count: { type: "number", label: { zh: "显示几个最近对话", en: "Chats to show" }, default: 9, min: 3, max: 24 }
  });
  var L11 = {
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
  var CSS7 = `
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
    category: "chats",
    icon: "grid",
    enabledByDefault: true,
    dependencies: ["RouterApi", "HotkeysApi", "ChatStateApi"],
    settings: settings16,
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
      const { box } = createHost(scope, "recent-chats", CSS7);
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
        const list = visits.get().slice(0, settings16.store.count);
        const cards = h("div", { class: "cards" });
        list.forEach((visit, i) => {
          const card = h("button", { type: "button", class: `card${i === selected ? " sel" : ""}${visit.id === currentRoute().chatId ? " cur" : ""}` }, i < 9 ? h("span", { class: "n", text: String(i + 1) }) : null, h("span", { class: "t", text: visit.title || visit.id.slice(0, 8) }), h("span", { class: "s", text: agoText(visit.at) }));
          card.addEventListener("click", () => go(visit));
          cards.appendChild(card);
        });
        const overlay = h("div", { class: "overlay", role: "dialog", "aria-label": t(L11.title) }, h("div", { class: "box" }, h("h3", {}, t(L11.title), h("span", { text: t(L11.hint) })), list.length ? cards : h("div", { class: "empty", text: t(L11.empty) })));
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
      if (settings16.store.hotkey.trim())
        bindKey(scope, settings16.store.hotkey, toggle, { inInputs: true });
      scope.listen(window, "keydown", (event) => {
        if (!open)
          return;
        const list = visits.get().slice(0, settings16.store.count);
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
  var settings17 = definePluginSettings({
    timestamps: { type: "boolean", label: { zh: "Markdown 里包含时间", en: "Include times in Markdown" }, default: true }
  });
  var L12 = {
    title: { zh: "导出对话", en: "Export chat" },
    md: { zh: "Markdown (.md)", en: "Markdown (.md)" },
    txt: { zh: "纯文本 (.txt)", en: "Plain text (.txt)" },
    json: { zh: "JSON (.json)", en: "JSON (.json)" },
    copy: { zh: "复制为 Markdown", en: "Copy as Markdown" },
    copied: { zh: "已复制到剪贴板", en: "Copied to the clipboard" },
    failed: { zh: "导出失败：{e}", en: "Export failed: {e}" },
    note: { zh: "导出当前显示的分支，内容来自 claude.ai 接口。", en: "Exports the branch on screen, read from claude.ai's API." }
  };
  var stamp = (at) => at ? new Date(at).toLocaleString() : "";
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
    title: L12.title,
    description: { zh: "对话标题栏加一个导出按钮：下载 Markdown / 纯文本 / JSON，或复制为 Markdown。", en: "An export button in the chat header: download Markdown, text or JSON, or copy as Markdown." },
    category: "chats",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "SlotsApi", "NoticesApi", "RouterApi"],
    settings: settings17,
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
            const md = toMarkdown(chat, settings17.store.timestamps);
            if (format === "md")
              download(`${name}.md`, md, "text/markdown");
            else {
              await navigator.clipboard.writeText(md);
              toast(t(L12.copied), { kind: "ok", timeoutMs: 2500 });
            }
          }
        } catch (error) {
          toast(t(L12.failed).replace("{e}", error.message || String(error)), { kind: "error" });
        }
      };
      addSlotItem(scope, "header", "export", () => {
        const btn = slotButton(t(L12.title), (event) => popover.open(event.currentTarget, (panel) => {
          panel.appendChild(h("div", { class: "top" }, icon("download", 16), h("b", { text: t(L12.title) })));
          for (const [format, label] of [["md", L12.md], ["txt", L12.txt], ["json", L12.json], ["copy", L12.copy]]) {
            const item = h("button", { type: "button", class: "item", text: t(label) });
            item.addEventListener("click", () => void run(format));
            panel.appendChild(item);
          }
          panel.appendChild(h("div", { class: "msg", text: t(L12.note), style: { fontSize: "12px" } }));
        }), icon("download", 16));
        btn.hidden = !currentRoute().chatId;
        return btn;
      }, 20);
    }
  });

  // src/plugins/messageTimestamps/index.ts
  var settings18 = definePluginSettings({
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
    settings: settings18,
    start(scope) {
      if (settings18.store.always)
        addStyle(scope, `${SEL.messageActions} ${SEL.messageTime} { opacity: 1 !important; visibility: visible !important; }`, "timestamps");
      if (!settings18.store.absolute)
        return;
      watch(scope, `${SEL.messageActions} ${SEL.messageTime}`, (el) => {
        const paint = () => {
          const at = Date.parse(el.getAttribute("datetime") ?? "");
          if (!Number.isFinite(at))
            return;
          const text = dateTimeText(at);
          if (el.textContent !== text)
            el.textContent = text;
          el.title = new Date(at).toLocaleString();
        };
        paint();
        const observer = new MutationObserver(paint);
        observer.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["datetime"] });
        return () => observer.disconnect();
      });
    }
  });

  // src/plugins/collapseCode/index.ts
  var settings19 = definePluginSettings({
    lines: { type: "number", label: { zh: "超过多少行折叠（行）", en: "Collapse code longer than (lines)" }, default: 30, min: 8, max: 200, step: 2 }
  });
  var L13 = { expand: { zh: "展开全部代码（{n} 行）", en: "Show all {n} lines" }, collapse: { zh: "收起代码", en: "Collapse code" } };
  var CSS8 = `
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
    settings: settings19,
    start(scope) {
      addStyle(scope, CSS8, "collapse-code");
      const max = settings19.store.lines;
      watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] pre`, (pre) => {
        const lines = (pre.textContent ?? "").split(`
`).length;
        if (lines <= max)
          return;
        pre.style.setProperty("--ccpp-code-max", `${max}lh`);
        pre.classList.add("ccpp-code-collapsed");
        const button = h("button", { type: "button", class: "ccpp-code-toggle", text: t(L13.expand).replace("{n}", String(lines)) });
        button.addEventListener("click", () => {
          const collapsed = pre.classList.toggle("ccpp-code-collapsed");
          button.textContent = collapsed ? t(L13.expand).replace("{n}", String(lines)) : t(L13.collapse);
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
  var logger10 = new Logger("NoTelemetry");
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
          logger10.debug(`Blocked ${blocked} telemetry requests so far`);
        return hit;
      });
    }
  });

  // src/plugins/consoleJanitor/index.ts
  var settings20 = definePluginSettings({
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
    settings: settings20,
    start(scope) {
      const target = pageWindow.console;
      const levels = settings20.store.levels === "warn" ? ["log", "info", "debug", "warn"] : ["log", "info", "debug"];
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
    quickCss_default,
    backup_default,
    usageDisplay_default,
    chatNavigator_default,
    messageStars_default,
    projectStatus_default,
    inputHistory_default,
    promptPresets_default,
    replyNotification_default,
    tabStatus_default,
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
    consoleJanitor_default
  ];

  // src/index.ts
  var FLAG = "__ccpp";
  var GLOBAL = "CCPP";
  var logger11 = new Logger("Kernel");
  function exposeRuntime(win) {
    const runtime = Object.freeze({
      version: "[20261013] v0.1.0",
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
    win[FLAG] = "[20261013] v0.1.0";
    registerPlugins(PLUGINS);
    exposeRuntime(win);
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
    logger11.info(`CC++ ${"[20261013] v0.1.0"} started with ${PLUGINS.length} plugins`);
  }
  boot();
})();
