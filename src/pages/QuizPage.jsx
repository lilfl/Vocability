import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '../lib/SettingsContext'
import { queryDatabase, updatePage, parseVocabPage, buildNotionProperties } from '../lib/notion'
import { sm2, isDue } from '../lib/sm2'
import { RotateCcw, Volume2, ExternalLink, ChevronRight, Loader, AlertCircle } from 'lucide-react'
import styles from './QuizPage.module.css'

const QUALITY_LABELS = [
  { q: 0, label: 'Blackout', color: '#c0392b', bg: '#fde8e8', desc: 'Complete forget' },
  { q: 1, label: 'Wrong',    color: '#c07020', bg: '#fdf0e0', desc: 'Wrong but recalled' },
  { q: 2, label: 'Hard',     color: '#907010', bg: '#fdf8e0', desc: 'Wrong, easy after' },
  { q: 3, label: 'Good',     color: '#1a7a6e', bg: '#d0ebe8', desc: 'Correct, difficult' },
  { q: 4, label: 'Easy',     color: '#205090', bg: '#d8e8fc', desc: 'Correct, hesitated' },
  { q: 5, label: 'Perfect',  color: '#401080', bg: '#eee0fc', desc: 'Perfect!' },
]

function StatBadge({ label, value }) {
  return (
    <div className={styles.statBadge}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

export default function QuizPage() {
  const { settings } = useSettings()
  const [cards, setCards] = useState([])
  const [queue, setQueue] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionStats, setSessionStats] = useState({ done: 0, again: 0 })
  const [done, setDone] = useState(false)

  const fetchCards = useCallback(async () => {
    if (!settings.notionToken || !settings.notionDbId) {
      setError('Notion settings not configured. Go to Settings.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const results = []
      let cursor = undefined
      do {
        const data = await queryDatabase(
          settings.notionToken,
          settings.notionDbId,
          undefined,
          [{ property: 'sm2_dueDate', direction: 'ascending' }],
          cursor
        )
        results.push(...data.results.map(parseVocabPage))
        cursor = data.has_more ? data.next_cursor : undefined
      } while (cursor)

      const due = results.filter(isDue)
      // Sort: new cards first (repetition=0), then by dueDate
      due.sort((a, b) => {
        if (a.sm2_repetition === 0 && b.sm2_repetition !== 0) return -1
        if (b.sm2_repetition === 0 && a.sm2_repetition !== 0) return 1
        return (a.sm2_dueDate ?? '').localeCompare(b.sm2_dueDate ?? '')
      })

      setCards(results)
      setQueue(due)
      setCurrentIdx(0)
      setFlipped(false)
      setDone(due.length === 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [settings.notionToken, settings.notionDbId])

  useEffect(() => { fetchCards() }, [fetchCards])

  const current = queue[currentIdx]

  const handleGrade = async (quality) => {
    if (!current) return
    const updated = sm2(current, quality)
    const newCard = { ...current, ...updated }

    // Update Notion
    try {
      await updatePage(settings.notionToken, current.id, buildNotionProperties(newCard))
    } catch (err) {
      console.error('Failed to update Notion:', err)
    }

    setSessionStats(s => ({
      done: s.done + 1,
      again: quality < 3 ? s.again + 1 : s.again,
    }))

    // If failed (quality < 3), re-queue at the end
    if (quality < 3) {
      setQueue(q => {
        const next = [...q]
        next.splice(currentIdx, 1)
        next.push(newCard)
        return next
      })
      // stay at same index (next card slides in)
      setFlipped(false)
    } else {
      const nextIdx = currentIdx + 1
      if (nextIdx >= queue.length) {
        setDone(true)
      } else {
        setCurrentIdx(nextIdx)
        setFlipped(false)
      }
    }
  }

  const totalDue = queue.length
  const progress = Math.min(100, (currentIdx / (totalDue || 1)) * 100)

  if (loading) {
    return (
      <div className={styles.center}>
        <Loader size={28} className={styles.spin} />
        <p>Loading vocabulary from Notion...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.center}>
        <AlertCircle size={24} color="var(--accent)" />
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={fetchCards}>Retry</button>
      </div>
    )
  }

  if (done || !current) {
    return (
      <div className={styles.donePage}>
        <div className={styles.doneCard}>
          <div className={styles.doneEmoji}>🎉</div>
          <h2 className={styles.doneTitle}>Session Complete!</h2>
          <p className={styles.doneSub}>You reviewed {sessionStats.done} cards today.</p>
          <div className={styles.doneStats}>
            <StatBadge label="Reviewed" value={sessionStats.done} />
            <StatBadge label="Re-queued" value={sessionStats.again} />
            <StatBadge label="Due tomorrow" value={cards.filter(c => !isDue(c)).length} />
          </div>
          <button className={styles.restartBtn} onClick={fetchCards}>
            <RotateCcw size={15} /> Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Progress */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.container}>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            {current.Difficulty && <span className={`tag tag--difficulty-${current.Difficulty}`}>{current.Difficulty}</span>}
            {current.POS && <span className="tag tag--pos">{current.POS}</span>}
            {current.Frequency && <span className={`tag tag--freq-${current.Frequency}`}>{current.Frequency}</span>}
          </div>
          <span className={styles.counter}>{currentIdx + 1} / {totalDue}</span>
        </div>

        {/* Card */}
        <div className={`${styles.card} ${flipped ? styles.flipped : ''}`} onClick={() => !flipped && setFlipped(true)}>
          <div className={styles.cardInner}>
            {/* Front */}
            <div className={styles.cardFront}>
              <p className={styles.tapHint}>tap to reveal</p>
              <h2 className={styles.word}>{current.Vocabulary}</h2>
              {current.Phonetic && <p className={styles.phonetic}>{current.Phonetic}</p>}
              {current.CoreImage && (
                <p className={styles.coreImage}>"{current.CoreImage}"</p>
              )}
            </div>

            {/* Back */}
            <div className={styles.cardBack}>
              <h2 className={styles.wordBack}>{current.Vocabulary}</h2>
              {current.Phonetic && <p className={styles.phonetic}>{current.Phonetic}</p>}

              <div className={styles.meaning}>{current.Meaning}</div>

              {current.Example && (
                <div className={styles.example}>
                  <span className={styles.exampleLabel}>Example</span>
                  <p>{current.Example}</p>
                </div>
              )}

              {current.Paraphrase && (
                <div className={styles.paraphrase}>
                  <span className={styles.exampleLabel}>Paraphrase</span>
                  <p>{current.Paraphrase}</p>
                </div>
              )}

              {current.Memo && (
                <div className={styles.memo}>💬 {current.Memo}</div>
              )}

              <div className={styles.tagRow}>
                {current.Usage && <span className="tag tag--usage">{current.Usage}</span>}
                {current.CasualLevel && <span className="tag tag--casual">{current.CasualLevel}</span>}
                {(current.Type || []).map(t => <span key={t} className="tag tag--type">{t}</span>)}
                {(current.EmotionTone || []).map(t => <span key={t} className="tag tag--emotion">{t}</span>)}
              </div>

              <div className={styles.links}>
                {current.AudioURL && (
                  <a href={current.AudioURL} target="_blank" rel="noopener noreferrer" className={styles.audioLink}
                    onClick={e => e.stopPropagation()}>
                    <Volume2 size={14} /> Listen on Youglish
                  </a>
                )}
                {current.SimilarSpelling && (
                  <span className={styles.similar}>
                    Similar: <em>{current.SimilarSpelling}</em>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grade buttons */}
        {flipped && (
          <div className={styles.grades}>
            <p className={styles.gradeHint}>How well did you remember?</p>
            <div className={styles.gradeButtons}>
              {QUALITY_LABELS.map(({ q, label, color, bg, desc }) => (
                <button
                  key={q}
                  className={styles.gradeBtn}
                  style={{ '--grade-color': color, '--grade-bg': bg }}
                  onClick={() => handleGrade(q)}
                  title={desc}
                >
                  <span className={styles.gradeBtnLabel}>{label}</span>
                  <span className={styles.gradeBtnQ}>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!flipped && (
          <button className={styles.flipBtn} onClick={() => setFlipped(true)}>
            Show Answer <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
