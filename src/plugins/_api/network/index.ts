/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { pageWindow } from "@lib/page";

const logger = new Logger("NetworkApi");

export interface RequestInfoLite {
    url: URL;
    method: string;
}

type Matcher = (req: RequestInfoLite) => boolean;
type ResponseHandler = (response: Response, req: RequestInfoLite) => void;

const responseHooks = new Set<{ match: Matcher; handle: ResponseHandler }>();
const blockers = new Set<Matcher>();

export function describe(input: RequestInfo | URL, init?: RequestInit): RequestInfoLite | null {
    try {
        const raw = input instanceof Request ? input.url : String(input);
        const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
        return { url: new URL(raw, location.href), method };
    } catch {
        return null;
    }
}

/**
 * Observes matching responses. The page gets the original response untouched; handlers
 * receive a clone and run after the page has it.
 */
export function onResponse(scope: Scope, match: Matcher, handle: ResponseHandler) {
    const hook = { match, handle };
    responseHooks.add(hook);
    scope.defer(() => responseHooks.delete(hook));
}

/** Answers matching requests with an empty 204 instead of sending them. */
export function block(scope: Scope, match: Matcher) {
    blockers.add(match);
    scope.defer(() => blockers.delete(match));
}

export const isBlocked = (req: RequestInfoLite) => [...blockers].some(match => {
    try {
        return match(req);
    } catch {
        return false;
    }
});

export const sameOrigin = (req: RequestInfoLite) => req.url.origin === location.origin;

export default definePlugin({
    name: "NetworkApi",
    title: { zh: "网络观察", en: "Network API" },
    description: {
        zh: "包装 fetch / sendBeacon：插件可以旁路读取响应副本，或拦截指定请求。不修改 claude.ai 拿到的原响应。",
        en: "Wraps fetch / sendBeacon so plugins can read response copies or block requests. claude.ai's own responses are never altered.",
    },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
        const original = pageWindow.fetch;
        const wrapped = function fetch(this: unknown, input: RequestInfo | URL, init?: RequestInit) {
            const req = describe(input, init);
            if (req && blockers.size && isBlocked(req)) return Promise.resolve(new Response(null, { status: 204 }));
            const promise = original.call(this ?? pageWindow, input, init);
            if (req && responseHooks.size) {
                const hooks = [...responseHooks].filter(hook => {
                    try {
                        return hook.match(req);
                    } catch {
                        return false;
                    }
                });
                if (hooks.length) {
                    promise.then(response => {
                        for (const hook of hooks) {
                            try {
                                hook.handle(response.clone(), req);
                            } catch (error) {
                                logger.error("Response hook failed:", error);
                            }
                        }
                    }, () => {});
                }
            }
            return promise;
        } as typeof fetch;
        pageWindow.fetch = wrapped;
        scope.defer(() => {
            if (pageWindow.fetch === wrapped) pageWindow.fetch = original;
        });

        const beacon = pageWindow.navigator.sendBeacon?.bind(pageWindow.navigator);
        if (beacon) {
            const wrappedBeacon = (url: string | URL, data?: BodyInit | null) => {
                const req = describe(url, { method: "POST" });
                if (req && isBlocked(req)) return true;
                return beacon(url, data);
            };
            pageWindow.navigator.sendBeacon = wrappedBeacon;
            scope.defer(() => {
                if (pageWindow.navigator.sendBeacon === wrappedBeacon) pageWindow.navigator.sendBeacon = beacon;
            });
        }
    },
});
