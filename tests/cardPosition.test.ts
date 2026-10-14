import assert from "node:assert/strict";
import { test } from "node:test";
import { cardPosition } from "../plugins/pingFlash/cardPosition.ts";

test("places the card to the right of the icon and inside the window", () => {
  const byRight = cardPosition(
    { left: 10, right: 58, top: 100, height: 48 },
    { width: 800, height: 600 },
    { width: 240, height: 72 }
  );
  assert.equal(byRight.left, 66);
  assert.equal(byRight.top, 100);

  const flipped = cardPosition(
    { left: 700, right: 748, top: 100, height: 48 },
    { width: 800, height: 600 },
    { width: 240, height: 72 }
  );
  assert.equal(flipped.left, 700 - 8 - 240);
  assert.ok(flipped.left >= 0);
  assert.ok(flipped.left + 240 <= 800);
});
