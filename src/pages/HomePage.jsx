import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../lib/SettingsContext'
import { queryDatabase, parseVocabPage } from '../lib/notion'
import { isDue, daysUntilDue } from '../lib/sm2'
import { BookOpen, PlusCircle, Settings, Loader } from 'lucide-react'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { settings } = useSettings()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!settings.notionToken || !settings.notionDbId) return
    setLoading(true)
    ;(async () => {
      try {
        const results = []
        let cursor
        do {
          const data = await queryDatabase(settings.notionToken, settings.notionDbId, undefined, undefined, cursor)
          results.push(...data.results.map(parseVocabPage))
          cursor = data.has_more ? data.next_cursor : undefined
        } while (cursor)

        const due = results.filter(isDue).length
        const newCards = results.filter(c => c.sm2_repetition === 0).length
        const byDiff = {}
        results.forEach(c => {
          const d = c.Difficulty || 'Unknown'
          byDiff[d] = (byDiff[d] || 0) + 1
        })
        setStats({ total: results.length, due, newCards, byDiff })
      } catch {}
      setLoading(false)
    })()
  }, [settings.notionToken, settings.notionDbId])

  const noConfig = !settings.notionToken || !settings.notionDbId

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Vocability</h1>
        <p className={styles.heroSub}>Your personal vocabulary knowledge base, powered by spaced repetition.</p>
      </div>

      {noConfig && (
        <div className={styles.setupBanner}>
          <Settings size={16} />
          <span>Set up your Notion API key and Database ID to get started.</span>
          <Link to="/settings" className={styles.setupLink}>Go to Settings →</Link>
        </div>
      )}

      <div className={styles.cards}>
        <Link to="/quiz" className={`${styles.card} ${styles.cardQuiz}`}>
          <BookOpen size={28} />
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Quiz</h2>
            <p className={styles.cardDesc}>Review due vocabulary cards with SM-2 spaced repetition.</p>
          </div>
          {loading && <Loader size={14} className={styles.spin} />}
          {stats && (
            <div className={styles.cardBadge}>{stats.due} due</div>
          )}
        </Link>

        <Link to="/add" className={`${styles.card} ${styles.cardAdd}`}>
          <PlusCircle size={28} />
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Add Vocabulary</h2>
            <p className={styles.cardDesc}>Add new words with AI-generated metadata, saved to Notion.</p>
          </div>
        </Link>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.total}</span>
            <span className={styles.statLbl}>Total Words</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.due}</span>
            <span className={styles.statLbl}>Due Today</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.newCards}</span>
            <span className={styles.statLbl}>New</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.total - stats.due}</span>
            <span className={styles.statLbl}>Learned</span>
          </div>
        </div>
      )}
    </div>
  )
}
