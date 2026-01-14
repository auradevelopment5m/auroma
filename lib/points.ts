export function calculatePointsEarned(total: number): number {
  if (total >= 76) return 50
  if (total >= 41) return 20
  if (total >= 5) return 10
  return 0
}

export const REDEMPTION_TIERS = [
  { points: 100, credit: 5 },
  { points: 150, credit: 10 },
  { points: 200, credit: 20 },
  { points: 250, credit: 25 },
] as const

export type RedemptionTier = (typeof REDEMPTION_TIERS)[number]
