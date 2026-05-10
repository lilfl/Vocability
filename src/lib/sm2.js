/**
 * SM-2 Algorithm implementation
 * quality: 0-5
 *   0 = complete blackout
 *   1 = wrong, remembered on seeing answer
 *   2 = wrong, easy after seeing answer
 *   3 = correct, significant difficulty
 *   4 = correct, some hesitation
 *   5 = perfect response
 */
export function sm2(card, quality) {
  let { sm2_interval, sm2_repetition, sm2_easeFactor } = card

  // Clamp quality
  quality = Math.max(0, Math.min(5, quality))

  if (quality < 3) {
    // Failed — restart
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

  // Update ease factor
  sm2_easeFactor = sm2_easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (sm2_easeFactor < 1.3) sm2_easeFactor = 1.3

  // Calculate next due date
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + sm2_interval)
  const sm2_dueDate = dueDate.toISOString().split('T')[0]

  return { sm2_interval, sm2_repetition, sm2_easeFactor, sm2_dueDate }
}

export function isDue(card) {
  const today = new Date().toISOString().split('T')[0]
  return (card.sm2_dueDate ?? today) <= today
}

export function daysUntilDue(card) {
  const today = new Date()
  const due = new Date(card.sm2_dueDate ?? today)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  return diff
}
