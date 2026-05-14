import type { SM2Card } from '../types'

export function sm2(card: SM2Card, quality: number): SM2Card {
  let { sm2_interval, sm2_repetition, sm2_easeFactor } = card

  quality = Math.max(0, Math.min(5, quality))

  if (quality < 3) {
    sm2_repetition = 0
    sm2_interval = 1
  } else {
    if (sm2_repetition === 0) {
      sm2_interval = 1
    } else if (sm2_repetition === 1) {
      sm2_interval = 6
    } else {
      sm2_interval = Math.round(sm2_interval * sm2_easeFactor)
    }
    sm2_repetition += 1
  }

  sm2_easeFactor = sm2_easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (sm2_easeFactor < 1.3) sm2_easeFactor = 1.3

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + sm2_interval)
  const sm2_dueDate = dueDate.toISOString().split('T')[0]

  return { sm2_interval, sm2_repetition, sm2_easeFactor, sm2_dueDate }
}

export function isDue(card: Pick<SM2Card, 'sm2_dueDate'>): boolean {
  const today = new Date().toISOString().split('T')[0]
  return (card.sm2_dueDate ?? today) <= today
}

export function daysUntilDue(card: Pick<SM2Card, 'sm2_dueDate'>): number {
  const today = new Date()
  const due = new Date(card.sm2_dueDate ?? today.toISOString().split('T')[0])
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
