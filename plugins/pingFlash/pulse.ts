import { previewLine } from "./preview.ts";
import { visibleTarget, type RailSnapshot } from "./target.ts";

export const PULSE_MS = 3000;

export const GUILD_NOTIFICATION_SOUNDS = ["message1", "message2", "mention1", "mention2", "mention3"] as const;

export interface CardContent {
  serverName: string;
  channelName: string;
  authorName: string;
  line: string;
}

export interface Pulse {
  visibleId: string;
  guildId: string;
  folderId: string | null;
  startedAt: number;
  card: CardContent;
}

export interface IncomingSound {
  sound: string;
  guildId: string | null;
  content: string;
  authorName: string;
  guildName: string;
  channelName: string;
  hasImage: boolean;
  hasSticker: boolean;
  hasAttachment: boolean;
  hasEmbed: boolean;
}

const guildSounds = new Set<string>(GUILD_NOTIFICATION_SOUNDS);

export function pickTestGuildId(
  guildIds: readonly string[],
  rail: RailSnapshot
): string | null {
  const seen = new Set<string>();
  for (const id of guildIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (visibleTarget(id, rail)) return id;
  }
  return null;
}

export function ringDuration(test: boolean): number | null {
  return test ? null : PULSE_MS;
}

export function acceptPlayedSound(
  current: Pulse | null,
  incoming: IncomingSound,
  rail: RailSnapshot,
  now: number
): Pulse | null {
  if (!guildSounds.has(incoming.sound) || !incoming.guildId) return current;
  const target = visibleTarget(incoming.guildId, rail);
  if (!target) return current;
  return {
    visibleId: target.visibleId,
    guildId: incoming.guildId,
    folderId: target.folderId,
    startedAt: now,
    card: {
      serverName: incoming.guildName,
      channelName: incoming.channelName,
      authorName: incoming.authorName,
      line: previewLine(incoming)
    }
  };
}

export function cardForHover(
  pulse: Pulse | null,
  hoveredVisibleId: string | null
): CardContent | null {
  if (!pulse) return null;
  if (hoveredVisibleId !== pulse.visibleId) return null;
  return pulse.card;
}

export interface CardHold {
  engaged: boolean;
  dismissed: boolean;
}

export function holdCard(
  pulse: Pulse | null,
  hoveredVisibleId: string | null,
  hold: CardHold
): { card: CardContent | null; hold: CardHold } {
  if (!pulse) return { card: null, hold: { engaged: false, dismissed: false } };
  if (hold.dismissed) return { card: null, hold: { engaged: true, dismissed: true } };
  if (hoveredVisibleId === pulse.visibleId) {
    return { card: pulse.card, hold: { engaged: true, dismissed: false } };
  }
  if (hold.engaged) return { card: null, hold: { engaged: true, dismissed: true } };
  return { card: null, hold: { engaged: false, dismissed: false } };
}
