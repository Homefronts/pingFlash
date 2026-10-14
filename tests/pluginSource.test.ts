import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("the plugin names pingFlash, guild sounds, and the rail id", () => {
  const src = readFileSync(new URL("../plugins/pingFlash/index.tsx", import.meta.url), "utf8");
  const nameAt = src.indexOf('name: "pingFlash"');
  const descriptionAt = src.indexOf("description:");
  assert.ok(nameAt >= 0 && nameAt < descriptionAt);
  for (const sound of ["message1", "message2", "mention1", "mention2", "mention3"]) {
    assert.match(src, new RegExp(`playSound\\("${sound}"\\)`));
  }
  assert.doesNotMatch(src, /playSound\("message3"\)/);
  assert.match(src, /guildsnav___/);
});
