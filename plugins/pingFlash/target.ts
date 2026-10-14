export interface RailSnapshot {
  mountedGuildIds: ReadonlySet<string>;
  mountedFolderIds: ReadonlySet<string>;
  folders: ReadonlyArray<{ folderId: string; guildIds: readonly string[]; expanded: boolean }>;
}

export interface VisibleTarget {
  visibleId: string;
  folderId: string | null;
}

export function visibleTarget(guildId: string, rail: RailSnapshot): VisibleTarget | null {
  if (rail.mountedGuildIds.has(guildId)) {
    return { visibleId: guildId, folderId: null };
  }
  const folder = rail.folders.find(entry =>
    !entry.expanded &&
    entry.guildIds.includes(guildId) &&
    rail.mountedFolderIds.has(entry.folderId)
  );
  if (!folder) return null;
  return { visibleId: folder.folderId, folderId: folder.folderId };
}
