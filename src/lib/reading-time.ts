export function estimateReadingTime(text: string): number {
  const textContent = text.replace(/<[^>]+>/g, "");
  const words = textContent.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
