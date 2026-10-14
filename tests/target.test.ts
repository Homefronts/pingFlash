import assert from "node:assert/strict";
import { test } from "node:test";
import { visibleTarget, type RailSnapshot } from "../plugins/pingFlash/target.ts";

const rail = (over: Partial<RailSnapshot> = {}): RailSnapshot => ({
  mountedGuildIds: new Set<string>(),
  mountedFolderIds: new Set<string>(),
  folders: [],
  ...over
});

test("prefers the guild icon when it is mounted", () => {
  const found = visibleTarget("g1", rail({
    mountedGuildIds: new Set(["g1"]),
    folders: [{ folderId: "f1", guildIds: ["g1"], expanded: false }],
    mountedFolderIds: new Set(["f1"])
  }));
  assert.deepEqual(found, { visibleId: "g1", folderId: null });
});

test("pulses a collapsed folder when the guild icon is not mounted", () => {
  const found = visibleTarget("g1", rail({
    folders: [{ folderId: "f1", guildIds: ["g1", "g2"], expanded: false }],
    mountedFolderIds: new Set(["f1"])
  }));
  assert.deepEqual(found, { visibleId: "f1", folderId: "f1" });
});

test("skips an expanded folder whose guild icon is not mounted", () => {
  const found = visibleTarget("g1", rail({
    folders: [{ folderId: "f1", guildIds: ["g1"], expanded: true }],
    mountedFolderIds: new Set(["f1"])
  }));
  assert.equal(found, null);
});
