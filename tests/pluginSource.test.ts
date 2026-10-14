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
  assert.match(src, /Send a test notification/);
  assert.match(src, /pickTestGuildId\(/);
  assert.match(src, /applyPulse\(next, true\)/);
  assert.match(src, /ringDuration\(/);
  assert.match(src, /authorName: "DEV"/);
  assert.match(src, /This is a test notification!/);
  assert.match(src, /vc-pingFlash-ring/);
  assert.match(src, /vc-pingFlash-server/);
  assert.match(src, /vc-pingFlash-author/);
  assert.match(src, /vc-pingFlash-line/);
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
  assert.match(css, /\.vc-pingFlash-ring/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /scale\(1\.7\)/);
  assert.doesNotMatch(css, /0 0 0 10px/);
  assert.match(css, /\.vc-pingFlash-server[\s\S]*font-weight:\s*600/);
  assert.match(css, /\.vc-pingFlash-author[\s\S]*#b5bac1/);
  assert.match(css, /\.vc-pingFlash-line[\s\S]*margin-top:\s*6px/);
});
