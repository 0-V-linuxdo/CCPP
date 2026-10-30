/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/**
 * Every claude.ai landmark CC++ relies on, in one place. When claude.ai changes its markup,
 * this is the file to fix. Prefer data-testid / data-cds / aria over utility classes.
 */
export const SEL = {
    sidebar: '[data-testid="sidebar"]',
    sidebarRecents: '[data-testid="sidebar-recents"]',
    sidebarChatLink: 'a[href^="/chat/"]',
    /** The Code side of the Chat / Code switch at the top of the sidebar (locale-independent). */
    modeCode: '[role="radiogroup"] [role="radio"][data-mode="code"]',
    userMenuButton: '[data-testid="user-menu-button"]',
    userMenuName: '[data-testid="user-menu-button"] .df-user-menu-trailing',
    avatar: '[data-cds="Avatar"]',
    /** claude.ai's account menu (the popup of the avatar button), told apart from other menus by its Settings row. */
    accountMenu: '[role="menu"]:has([data-testid="user-menu-settings"])',
    chatHeader: '[data-testid="chat-header"]',
    headerActions: "#dframe-header-actions-slot",
    shareButton: '[data-testid="wiggle-controls-actions-share"]',
    transcript: '[data-testid="transcript-list"]',
    transcriptFeed: '[role="feed"][aria-label]',
    transcriptRow: '[data-testid="transcript-row"]',
    scroller: '[data-autoscroll-container="true"]',
    /** Chats mark your messages with a test id; Claude Code project chats only with data-cds. */
    userMessage: ':is([data-testid="user-message"], [data-cds="UserMessage"])',
    userMessageBody: ".cds-user-message-body",
    assistantMessage: '[data-testid="assistant-message"]',
    streaming: '[data-testid="assistant-message"][data-is-streaming="true"]',
    messageActions: '[data-testid="message-actions"]',
    /** The action bar under your own message (it fades in on hover; the time is its first child). */
    userMessageActions: '[data-testid="user-message-actions"]',
    /** Your message after claude.ai gave up sending it ("Failed to send · Retry · Discard"). */
    failedSend: '[data-cds="UserMessage"][data-state="failed"]',
    /** The Retry link on a failed message: the text link that isn't Discard (it has no test id of its own). */
    failedSendRetry: '[data-cds="TextLink"][role="button"]:not([data-testid="failed-send-discard"])',
    messageTime: 'time[data-cds="RelativeTime"]',
    prose: '[data-cds="Prose"]',
    composer: '[data-cds="ChatComposer"]',
    composerCard: "[data-composer-card-holder]",
    /** Chat input, or the Claude Code prompt (home, sessions and project threads). */
    editor: ':is([data-testid="chat-input"], [data-testid="code-prompt-input"])',
    sendButton: ':is([data-testid="chat-input-send"], [data-testid="code-prompt-send"])',
    /** Chat model picker, or the Claude Code one (home, sessions, project threads). */
    modelSelector: ':is([data-testid="model-selector-dropdown"], [data-testid="epitaxy-cds-model-selector"], [data-testid="environment-row-model"])',
    greeting: "[data-new-page-greeting-text]",
    /** The Claude spark beside the home greeting; layouts without the text marker are found from it. */
    greetingSpark: ':is([data-new-page-greeting-spark], svg[data-cds="Spark"])',
    /** A project page's Threads panel: its Waiting on you / Working / Idle / Resolved groups. */
    threadsPanel: ":is([data-home-section], [data-home-group], [data-home-heading])",
    /**
     * Text the user or Claude wrote: messages, the input, and links to chats, sessions, projects and threads
     * (their titles), in the sidebar or the Threads panel. Hiders matching claude.ai's own wording skip these,
     * so a chat titled "Upgrade" or "隐藏用量限制提示条" stays put.
     */
    userContent: ':is([data-testid="transcript-list"], [data-testid="transcript-row"], [data-testid="chat-input"], [data-testid="code-prompt-input"], [data-testid="sidebar-recents"], [data-home-section], [data-home-group], [data-home-heading], a[href^="/chat/"], a[href^="/code/"], a[href^="/project/"], a[href*="?thread="], [contenteditable="true"], textarea)',
    menu: '[role="menu"]',
    menuItem: '[role="menuitem"]',
    jumpToLatest: '[data-testid="jump-to-latest"]',
} as const;
