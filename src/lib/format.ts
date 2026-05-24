export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M+`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K+`
  if (value > 0 && value < 10) return value.toFixed(1)
  return String(Math.round(value))
}
