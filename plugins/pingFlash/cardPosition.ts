const GAP = 8;

export function cardPosition(
  rect: { left: number; right: number; top: number; height: number },
  viewport: { width: number; height: number },
  card: { width: number; height: number }
): { left: number; top: number } {
  let left = rect.right + GAP;
  if (left + card.width > viewport.width) {
    left = rect.left - GAP - card.width;
  }
  const maxLeft = Math.max(0, viewport.width - card.width);
  left = Math.min(Math.max(left, 0), maxLeft);
  const maxTop = Math.max(0, viewport.height - card.height);
  const top = Math.min(Math.max(rect.top, 0), maxTop);
  return { left, top };
}
