import assert from "node:assert/strict";
import { test } from "node:test";
import { previewLine } from "../plugins/pingFlash/preview.ts";

test("trims text and caps it at 140 characters", () => {
  const line = previewLine({
    content: "  " + "a".repeat(200) + "  ",
    hasImage: false, hasSticker: false, hasAttachment: false, hasEmbed: false
  });
  assert.equal(line.length, 140);
  assert.ok(line.endsWith("…"));
  assert.equal(line.startsWith("aaa"), true);
});

test("uses the first matching stand-in when text is empty", () => {
  const flags = { content: "   ", hasImage: false, hasSticker: false, hasAttachment: false, hasEmbed: true };
  assert.equal(previewLine({ ...flags, hasImage: true, hasSticker: true, hasAttachment: true }), "Sent an image");
  assert.equal(previewLine({ ...flags, hasSticker: true, hasAttachment: true }), "Sent a sticker");
  assert.equal(previewLine({ ...flags, hasAttachment: true }), "Sent an attachment");
  assert.equal(previewLine(flags), "Sent a message");
});
