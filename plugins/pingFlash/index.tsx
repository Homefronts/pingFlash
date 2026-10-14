/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Homefronts
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { findStoreLazy } from "@webpack";
import { ChannelStore, GuildStore } from "@webpack/common";

import { cardPosition } from "./cardPosition.ts";
import { hoveredRailId } from "./hoverTarget.ts";
import {
  acceptPlayedSound,
  holdCard,
  PULSE_MS,
  type CardHold,
  type IncomingSound,
  type Pulse
} from "./pulse.ts";
import type { RailSnapshot } from "./target.ts";
import style from "./style.css?managed";

const GUILD_NAV_PREFIX = "guildsnav___";
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;
const SortedGuildStore = findStoreLazy("SortedGuildStore") as {
  getGuildFolders(): Array<{ folderId?: string | number | null; guildIds: string[] }>;
};
const ExpandedGuildFolderStore = findStoreLazy("ExpandedGuildFolderStore") as {
  isFolderExpanded?(folderId: string | number): boolean;
  getExpandedFolders?(): Iterable<string | number>;
};

interface RawAttachment {
  content_type?: string;
  filename?: string;
}

interface RawMessage {
  guild_id?: string | null;
  channel_id?: string;
  content?: string;
  author?: { global_name?: string | null; username?: string };
  attachments?: RawAttachment[];
  sticker_items?: unknown[];
  embeds?: unknown[];
}

let pulse: Pulse | null = null;
let hold: CardHold = { engaged: false, dismissed: false };
let hoveredId: string | null = null;
let card: HTMLDivElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

function isImage(attachment: RawAttachment): boolean {
  return Boolean(attachment.content_type?.startsWith("image/") || IMAGE_EXT.test(attachment.filename ?? ""));
}

function asMessage(value: unknown): RawMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as RawMessage;
  if (typeof message.guild_id !== "string" || !message.guild_id) return null;
  return message;
}

function folderIsExpanded(folderId: string | number): boolean {
  if (typeof ExpandedGuildFolderStore.isFolderExpanded === "function") {
    return ExpandedGuildFolderStore.isFolderExpanded(folderId);
  }
  const expanded = ExpandedGuildFolderStore.getExpandedFolders?.();
  if (!expanded) return false;
  const id = String(folderId);
  for (const entry of expanded) {
    if (String(entry) === id) return true;
  }
  return false;
}

function readRail(): RailSnapshot {
  const folders = SortedGuildStore.getGuildFolders().flatMap(entry => {
    if (entry.folderId == null) return [];
    return [{
      folderId: String(entry.folderId),
      guildIds: entry.guildIds.map(String),
      expanded: folderIsExpanded(entry.folderId)
    }];
  });
  const folderIds = new Set(folders.map(entry => entry.folderId));
  const mountedGuildIds = new Set<string>();
  const mountedFolderIds = new Set<string>();
  for (const node of document.querySelectorAll(`[data-list-item-id^="${GUILD_NAV_PREFIX}"]`)) {
    const id = node.getAttribute("data-list-item-id")?.slice(GUILD_NAV_PREFIX.length);
    if (!id) continue;
    if (folderIds.has(id)) mountedFolderIds.add(id);
    else mountedGuildIds.add(id);
  }
  return { mountedGuildIds, mountedFolderIds, folders };
}

function toIncoming(sound: string, message: RawMessage): IncomingSound {
  const attachments = message.attachments ?? [];
  const hasImage = attachments.some(isImage);
  const guildId = message.guild_id ?? null;
  return {
    sound,
    guildId,
    content: message.content ?? "",
    authorName: message.author?.global_name || message.author?.username || "Someone",
    guildName: guildId ? GuildStore.getGuild(guildId)?.name ?? "" : "",
    channelName: message.channel_id ? ChannelStore.getChannel(message.channel_id)?.name ?? "" : "",
    hasImage,
    hasSticker: (message.sticker_items?.length ?? 0) > 0,
    hasAttachment: attachments.length > 0 && !hasImage,
    hasEmbed: (message.embeds?.length ?? 0) > 0
  };
}

function hideCard() {
  if (card) card.hidden = true;
}

function blockPress(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

function ensureCard(): HTMLDivElement {
  if (card) return card;
  card = document.createElement("div");
  card.className = "vc-pingFlash-card";
  card.addEventListener("click", blockPress);
  card.addEventListener("mousedown", blockPress);
  card.addEventListener("pointerdown", blockPress, true);
  card.addEventListener("mouseup", blockPress, true);
  document.body.appendChild(card);
  return card;
}

function iconNode(visibleId: string): Element | null {
  return document.querySelector(`[data-list-item-id="${GUILD_NAV_PREFIX}${visibleId}"]`);
}

function syncCard() {
  const result = holdCard(pulse, hoveredId, hold);
  hold = result.hold;
  const node = pulse ? iconNode(pulse.visibleId) : null;
  if (!result.card || !node) {
    hideCard();
    return;
  }
  const el = ensureCard();
  el.hidden = false;
  el.replaceChildren(
    textLine(result.card.serverName),
    textLine(result.card.channelName, "vc-pingFlash-channel"),
    textLine(result.card.authorName),
    textLine(result.card.line)
  );
  const rect = node.getBoundingClientRect();
  const pos = cardPosition(
    { left: rect.left, right: rect.right, top: rect.top, height: rect.height },
    { width: window.innerWidth, height: window.innerHeight },
    { width: 240, height: el.offsetHeight || 72 }
  );
  el.style.left = `${pos.left}px`;
  el.style.top = `${pos.top}px`;
}

function textLine(text: string, className?: string): HTMLDivElement {
  const line = document.createElement("div");
  if (className) line.className = className;
  line.textContent = text;
  return line;
}

function clearTimer() {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
}

function clearVisual() {
  clearTimer();
  for (const node of document.querySelectorAll(".vc-pingFlash-pulse")) {
    node.classList.remove("vc-pingFlash-pulse");
  }
  hideCard();
}

function applyPulse(next: Pulse | null) {
  if (next === pulse) return;
  clearVisual();
  pulse = next;
  hold = { engaged: false, dismissed: false };
  if (!pulse) return;
  iconNode(pulse.visibleId)?.classList.add("vc-pingFlash-pulse");
  syncCard();
  timer = setTimeout(() => {
    for (const node of document.querySelectorAll(".vc-pingFlash-pulse")) {
      node.classList.remove("vc-pingFlash-pulse");
    }
    timer = undefined;
  }, PULSE_MS);
}

function onPointerOver(event: Event) {
  const target = event.target instanceof Element ? event.target : null;
  const insideCard = target !== null && card !== null && card.contains(target);
  const node = target?.closest(`[data-list-item-id^="${GUILD_NAV_PREFIX}"]`) ?? null;
  const railId = node?.getAttribute("data-list-item-id")?.slice(GUILD_NAV_PREFIX.length) ?? null;
  hoveredId = hoveredRailId(insideCard, railId, hoveredId);
  syncCard();
}

export default definePlugin({
  name: "pingFlash",
  description: "Pulses the server icon that just played a notification sound.",
  authors: [{ name: "Homefronts", id: 0n }],
  managedStyle: style,
  patches: [
    {
      find: 'playSound("message1")',
      replacement: [
        {
          match: /playSound\("message1"\)/g,
          replace: 'playSound("message1"),$self.onGuildNotify("message1",arguments[0])'
        },
        {
          match: /playSound\("message2"\)/g,
          replace: 'playSound("message2"),$self.onGuildNotify("message2",arguments[0])'
        },
        {
          match: /playSound\("mention1"\)/g,
          replace: 'playSound("mention1"),$self.onGuildNotify("mention1",arguments[0])'
        },
        {
          match: /playSound\("mention2"\)/g,
          replace: 'playSound("mention2"),$self.onGuildNotify("mention2",arguments[0])'
        },
        {
          match: /playSound\("mention3"\)/g,
          replace: 'playSound("mention3"),$self.onGuildNotify("mention3",arguments[0])'
        }
      ]
    }
  ],
  onGuildNotify(sound: string, value: unknown) {
    const message = asMessage(value);
    if (!message) return;
    try {
      const next = acceptPlayedSound(pulse, toIncoming(sound, message), readRail(), Date.now());
      applyPulse(next);
    } catch {
      // A missing store or rail must not change the current pulse or throw into Discord.
    }
  },
  start() {
    document.addEventListener("pointerover", onPointerOver);
  },
  stop() {
    document.removeEventListener("pointerover", onPointerOver);
    pulse = null;
    hold = { engaged: false, dismissed: false };
    hoveredId = null;
    clearVisual();
    card?.remove();
    card = null;
  }
});
