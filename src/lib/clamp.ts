export function clamp(value: number | null, min: number, max: number) {
  if (value === null) return min

  return Math.min(Math.max(value, min), max)
}
