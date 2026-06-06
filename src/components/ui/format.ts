export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds % 60);
  return `${minutes}:${wholeSeconds.toString().padStart(2, "0")}`;
}

export function formatNumber(value: number, fractionDigits = 1): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(fractionDigits);
}
