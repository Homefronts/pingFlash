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
  hoveredVisibleId: string | null,
  now: number
): CardContent | null {
  if (!pulse) return null;
  if (hoveredVisibleId !== pulse.visibleId) return null;
  if (now >= pulse.startedAt + PULSE_MS) return null;
  return pulse.card;
}
