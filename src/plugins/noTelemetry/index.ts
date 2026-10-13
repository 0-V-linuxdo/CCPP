/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import { block, type RequestInfoLite } from "@api/network";

const logger = new Logger("NoTelemetry");

/** Analytics and error-reporting endpoints; none of them is needed for claude.ai to work. */
const HOSTS = /(^|\.)(sentry\.io|segment\.(io|com)|statsig(api)?\.(com|net)|featuregates\.org|intercom\.io|datadoghq\.(com|eu)|browser-intake-[a-z0-9-]+\.datadoghq\.(com|eu)|honeycomb\.io|googletagmanager\.com|google-analytics\.com)$/i;
const PATHS = /^\/(api\/event_logging|api\/(v\d\/)?(track|telemetry|metrics)|sentry|_\/(rum|logs))\b/i;

export function isTelemetry(req: RequestInfoLite) {
    if (HOSTS.test(req.url.hostname)) return true;
    return req.url.origin === location.origin && PATHS.test(req.url.pathname);
}

export default definePlugin({
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
        block(scope, req => {
            const hit = isTelemetry(req);
            if (hit && ++blocked % 50 === 1) logger.debug(`Blocked ${blocked} telemetry requests so far`);
            return hit;
        });
    },
});
