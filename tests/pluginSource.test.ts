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

test("a press on the card stays on the card", () => {
  const src = readFileSync(new URL("../plugins/pingFlash/index.tsx", import.meta.url), "utf8");
  assert.match(src, /hoveredRailId\(/);
  assert.match(src, /addEventListener\("pointerdown", blockPress, true\)/);
  assert.match(src, /addEventListener\("mouseup", blockPress, true\)/);
  assert.doesNotMatch(src, /setTimeout\(\(\) => \{\s*pulse = null;/);
  const css = readFileSync(new URL("../plugins/pingFlash/style.css", import.meta.url), "utf8");
  assert.match(css, /left:\s*-8px/);
  assert.match(css, /right:\s*-8px/);
});
