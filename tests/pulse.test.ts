import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptPlayedSound, cardForHover, holdCard, PULSE_MS, type IncomingSound, type Pulse } from "../plugins/pingFlash/pulse.ts";
import type { RailSnapshot } from "../plugins/pingFlash/target.ts";

const rail: RailSnapshot = {
  mountedGuildIds: new Set(["g1", "g2"]),
  mountedFolderIds: new Set(["f9"]),
  folders: [{ folderId: "f9", guildIds: ["g9"], expanded: false }]
};
const sound = (over: Partial<IncomingSound> = {}): IncomingSound => ({
  sound: "message1",
  guildId: "g1",
  content: "hello",
  authorName: "Alex",
  guildName: "Work",
  channelName: "announcements",
  hasImage: false, hasSticker: false, hasAttachment: false, hasEmbed: false,
  ...over
});

test("starts a 3 second pulse and shows the card only on that icon", () => {
  const pulse = acceptPlayedSound(null, sound(), rail, 1000);
  assert.equal(pulse?.visibleId, "g1");
  assert.equal(pulse?.card.line, "hello");
  assert.equal(pulse?.card.serverName, "Work");
  assert.equal(pulse?.card.channelName, "announcements");
  assert.equal(pulse?.card.authorName, "Alex");
  assert.deepEqual(cardForHover(pulse, "g1", 1000), pulse?.card);
  assert.equal(cardForHover(pulse, "g2", 1000), null);
  assert.deepEqual(cardForHover(pulse, "g1", 1000 + PULSE_MS), pulse?.card);
  assert.equal(cardForHover(pulse, null, 1000 + PULSE_MS), null);
  assert.equal(cardForHover(pulse, null, 1000), null);
});

test("the card does not return after the pointer leaves the icon", () => {
  const pulse = acceptPlayedSound(null, sound(), rail, 1000) as Pulse;
  const idle = { engaged: false, dismissed: false };
  const waiting = holdCard(pulse, null, idle);
  assert.equal(waiting.card, null);
  assert.equal(waiting.hold.dismissed, false);
  const showing = holdCard(pulse, "g1", waiting.hold);
  assert.deepEqual(showing.card, pulse.card);
  const left = holdCard(pulse, null, showing.hold);
  assert.equal(left.card, null);
  assert.equal(left.hold.dismissed, true);
  assert.equal(holdCard(pulse, "g1", left.hold).card, null);
});

test("a newer guild sound replaces the pulse", () => {
  const first = acceptPlayedSound(null, sound(), rail, 1000);
  const second = acceptPlayedSound(first, sound({ guildId: "g2", guildName: "Play", content: "next" }), rail, 2000);
  assert.equal(second?.visibleId, "g2");
  assert.equal(second?.startedAt, 2000);
  assert.equal(cardForHover(second, "g1", 2000), null);
  assert.equal(cardForHover(second, "g2", 2000)?.line, "next");
});

test("a DM sound and an off-screen guild leave the current pulse", () => {
  const first = acceptPlayedSound(null, sound(), rail, 1000) as Pulse;
  const dm = acceptPlayedSound(first, sound({ sound: "message3", guildId: null, guildName: "Alex" }), rail, 1500);
  assert.equal(dm, first);
  const hidden = acceptPlayedSound(first, sound({ guildId: "missing", guildName: "Hidden" }), rail, 1500);
  assert.equal(hidden, first);
});

test("mention sounds and collapsed folders pulse the folder and name the guild", () => {
  const pulse = acceptPlayedSound(null, sound({
    sound: "mention1", guildId: "g9", guildName: "Secret", content: "ping"
  }), rail, 5000);
  assert.equal(pulse?.visibleId, "f9");
  assert.equal(pulse?.folderId, "f9");
  assert.equal(pulse?.card.serverName, "Secret");
  assert.equal(cardForHover(pulse, "f9", 5000)?.line, "ping");
});
