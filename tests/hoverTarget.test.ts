import assert from "node:assert/strict";
import { test } from "node:test";
import { hoveredRailId } from "../plugins/pingFlash/hoverTarget.ts";

test("moving onto the card keeps the pulsing icon hovered", () => {
  assert.equal(hoveredRailId(true, null, "g1"), "g1");
  assert.equal(hoveredRailId(false, "g2", "g1"), "g2");
  assert.equal(hoveredRailId(false, null, "g1"), null);
});
