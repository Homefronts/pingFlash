export const EXCERPT_MAX = 140;

export interface PreviewInput {
  content: string;
  hasImage: boolean;
  hasSticker: boolean;
  hasAttachment: boolean;
  hasEmbed: boolean;
}

export function previewLine(input: PreviewInput): string {
  const text = input.content.replace(/\s+/g, " ").trim();
  if (text.length > EXCERPT_MAX) {
    return text.slice(0, EXCERPT_MAX - 1) + "…";
  }
  if (text.length > 0) return text;
  if (input.hasImage) return "Sent an image";
  if (input.hasSticker) return "Sent a sticker";
  if (input.hasAttachment) return "Sent an attachment";
  return "Sent a message";
}
