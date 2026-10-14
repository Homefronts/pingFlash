export function hoveredRailId(
  insideCard: boolean,
  railId: string | null,
  current: string | null
): string | null {
  if (insideCard) return current;
  return railId;
}
