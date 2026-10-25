/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Plugin } from "@kernel/plugins";

import claudeApi from "@api/claude";
import chatStateApi from "@api/chatState";
import composerApi from "@api/composer";
import domApi from "@api/dom";
import hotkeysApi from "@api/hotkeys";
import menuApi from "@api/menu";
import networkApi from "@api/network";
import noticesApi from "@api/notices";
import routerApi from "@api/router";
import slotsApi from "@api/slots";
import stylesApi from "@api/styles";
import transcriptApi from "@api/transcript";
import backup from "@core/backup";
import quickCss from "@core/quickCss";
import themes from "@core/themes";
import settings from "@core/settings";
import usageDisplay from "@plugins/usageDisplay";
import chatNavigator from "@plugins/chatNavigator";
import messageStars from "@plugins/messageStars";
import projectStatus from "@plugins/projectStatus";
import inputHistory from "@plugins/inputHistory";
import promptPresets from "@plugins/promptPresets";
import replyNotification from "@plugins/replyNotification";
import chatFavicon from "@plugins/chatFavicon";
import widerChat from "@plugins/widerChat";
import composerLook from "@plugins/composerLook";
import customGreeting from "@plugins/customGreeting";
import cleaner from "@plugins/cleaner";
import noShareLink from "@plugins/noShareLink";
import noDictation from "@plugins/noDictation";
import streamerMode from "@plugins/streamerMode";
import recentChats from "@plugins/recentChats";
import exportChat from "@plugins/exportChat";
import messageTimestamps from "@plugins/messageTimestamps";
import collapseCode from "@plugins/collapseCode";
import betterLinks from "@plugins/betterLinks";
import noTelemetry from "@plugins/noTelemetry";
import consoleJanitor from "@plugins/consoleJanitor";
import sidebarDefaultCode from "@plugins/sidebarDefaultCode";
import chatNoticeHider from "@plugins/chatNoticeHider";
import usageBannerHider from "@plugins/usageBannerHider";
import runningPill from "@plugins/runningPill";
import customIdentity from "@plugins/customIdentity";
import hideIdentity from "@plugins/hideIdentity";
import autoRetry from "@plugins/autoRetry";
import codeBrandColor from "@plugins/codeBrandColor";

/** Every plugin in the build. Order does not matter; the kernel sorts by dependencies. */
export const PLUGINS: Plugin[] = [
    domApi, stylesApi, routerApi, networkApi, claudeApi, chatStateApi, noticesApi, slotsApi, composerApi, transcriptApi, hotkeysApi, menuApi,
    settings, themes, quickCss, backup,
    usageDisplay, chatNavigator, messageStars, projectStatus, inputHistory, promptPresets, replyNotification, chatFavicon, widerChat, composerLook, customGreeting, cleaner, noShareLink, noDictation, streamerMode, recentChats, exportChat, messageTimestamps, collapseCode, betterLinks, noTelemetry, consoleJanitor, sidebarDefaultCode, chatNoticeHider, usageBannerHider, runningPill, customIdentity, hideIdentity, autoRetry, codeBrandColor,
];
