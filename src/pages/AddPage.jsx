import { useState, useRef } from 'react'
import { useSettings } from '../lib/SettingsContext'
import { generateVocabMetadata } from '../lib/openai'
import { createPage, buildNotionProperties } from '../lib/notion'
import { Upload, Plus, X, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import styles from './AddPage.module.css'

const DIFFICULTY_OPTIONS = ['Difficult', 'Challenging', 'Normal', 'Easy']
const POS_OPTIONS = ['ConjunctionAdverb','Sentence','Phrase','PhrasalVerb','Determiner','Interjection','Conjunction','Preposition','Adjective','Pronoun','Noun','Adverb','ModalVerb','Verb']
const USAGE_OPTIONS = ['Both', 'Spoken', 'Written']
const CASUAL_OPTIONS = ['Slang/VeryInformal','Casual','Neutral','Formal','VeryFormal']
const FREQ_OPTIONS = ['VeryCommon','Common','Occasionally','Rare']
const TYPE_OPTIONS = ['Business','Academic','Literary','Childlike','YouthSlang','OlderAdults','Feminine','Masculine']
const EMOTION_OPTIONS = ['Positive','Negative','Neutral','Humorous','Sarcastic','Polite','Rude','Soft','Harsh','Cute','Serious','Dramatic','Elegant','Aggressive','Warm','Cold']

function VocabCard({ vocab, index, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  const handleField = (field, value) => {
    onChange(index, { ...vocab, [field]: value })
  }

  const toggleMulti = (field, value) => {
    const arr = vocab[field] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    handleField(field, next)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.cardWord}>{vocab.Vocabulary || `Word ${index + 1}`}</span>
          {vocab.POS && <span className="tag tag--pos">{vocab.POS}</span>}
          {vocab.Difficulty && <span className={`tag tag--difficulty-${vocab.Difficulty}`}>{vocab.Difficulty}</span>}
        </div>
        <div className={styles.cardActions}>
          <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className={styles.removeBtn} onClick={() => onRemove(index)}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Vocabulary *</label>
            <input className={styles.input} value={vocab.Vocabulary || ''} onChange={e => handleField('Vocabulary', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Phonetic</label>
            <input className={styles.input} value={vocab.Phonetic || ''} onChange={e => handleField('Phonetic', e.target.value)} placeholder="/wɜːrd/" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Meaning (Japanese) *</label>
          <textarea className={styles.textarea} rows={2} value={vocab.Meaning || ''} onChange={e => handleField('Meaning', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Example</label>
          <textarea className={styles.textarea} rows={2} value={vocab.Example || ''} onChange={e => handleField('Example', e.target.value)} />
        </div>

        {/* Selects row */}
        <div className={styles.selectGrid}>
          {[
            ['Difficulty', DIFFICULTY_OPTIONS],
            ['POS', POS_OPTIONS],
            ['Usage', USAGE_OPTIONS],
            ['CasualLevel', CASUAL_OPTIONS],
            ['Frequency', FREQ_OPTIONS],
          ].map(([field, opts]) => (
            <div key={field} className={styles.field}>
              <label className={styles.label}>{field}</label>
              <select className={styles.select} value={vocab[field] || ''} onChange={e => handleField(field, e.target.value)}>
                <option value="">—</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {expanded && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Type</label>
              <div className={styles.chips}>
                {TYPE_OPTIONS.map(o => (
                  <button
                    key={o}
                    className={`${styles.chip} ${(vocab.Type || []).includes(o) ? styles.chipActive : ''}`}
                    onClick={() => toggleMulti('Type', o)}
                    type="button"
                  >{o}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Emotion / Tone</label>
              <div className={styles.chips}>
                {EMOTION_OPTIONS.map(o => (
                  <button
                    key={o}
                    className={`${styles.chip} ${(vocab.EmotionTone || []).includes(o) ? styles.chipEmotionActive : ''}`}
                    onClick={() => toggleMulti('EmotionTone', o)}
                    type="button"
                  >{o}</button>
                ))}
              </div>
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Core Image</label>
                <textarea className={styles.textarea} rows={2} value={vocab.CoreImage || ''} onChange={e => handleField('CoreImage', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Paraphrase</label>
                <textarea className={styles.textarea} rows={2} value={vocab.Paraphrase || ''} onChange={e => handleField('Paraphrase', e.target.value)} />
              </div>
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Similar Spelling</label>
                <input className={styles.input} value={vocab.SimilarSpelling || ''} onChange={e => handleField('SimilarSpelling', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Memo</label>
                <input className={styles.input} value={vocab.Memo || ''} onChange={e => handleField('Memo', e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Audio URL (Youglish)</label>
              <input className={styles.input} value={vocab.AudioURL || ''} onChange={e => handleField('AudioURL', e.target.value)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AddPage() {
  const { settings } = useSettings()
  const [words, setWords] = useState('')
  const [vocabs, setVocabs] = useState([])
  const [status, setStatus] = useState(null) // null | 'generating' | 'saving' | 'done' | 'error'
  const [error, setError] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setWords(ev.target.result)
    reader.readAsText(file)
  }

  const parseWords = (text) => {
    return text.split(/[\n,]+/).map(w => w.trim()).filter(Boolean)
  }

  const handleGenerate = async () => {
    const wordList = parseWords(words)
    if (!wordList.length) return

    if (!settings.openaiKey) {
      setError('OpenAI API Key is not set. Go to Settings.')
      setStatus('error')
      return
    }

    setStatus('generating')
    setError('')
    try {
      const results = await generateVocabMetadata(settings.openaiKey, wordList)
      setVocabs(results.map(r => ({ ...r, EmotionTone: r.EmotionTone || [] })))
      setStatus(null)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleVocabChange = (index, updated) => {
    setVocabs(v => v.map((item, i) => i === index ? updated : item))
  }

  const handleRemove = (index) => {
    setVocabs(v => v.filter((_, i) => i !== index))
  }

  const handleAddBlank = () => {
    setVocabs(v => [...v, {
      Vocabulary: '', Meaning: '', Example: '', Phonetic: '',
      Difficulty: 'Normal', POS: '', Usage: 'Both', CasualLevel: 'Neutral',
      Frequency: 'Common', Type: [], EmotionTone: [],
      CoreImage: '', Paraphrase: '', SimilarSpelling: '', Memo: '', AudioURL: '',
      sm2_interval: 1, sm2_repetition: 0, sm2_easeFactor: 2.5,
      sm2_dueDate: new Date().toISOString().split('T')[0],
    }])
  }

  const handleSave = async () => {
    if (!settings.notionToken || !settings.notionDbId) {
      setError('Notion Token or Database ID is not set. Go to Settings.')
      setStatus('error')
      return
    }

    setStatus('saving')
    setError('')
    let count = 0
    try {
      for (const vocab of vocabs) {
        if (!vocab.Vocabulary) continue
        const props = buildNotionProperties({
          ...vocab,
          sm2_interval: 1,
          sm2_repetition: 0,
          sm2_easeFactor: 2.5,
          sm2_dueDate: new Date().toISOString().split('T')[0],
        })
        await createPage(settings.notionToken, settings.notionDbId, props)
        count++
      }
      setSavedCount(count)
      setStatus('done')
      setVocabs([])
      setWords('')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Add Vocabularies</h1>
          <p className={styles.subtitle}>Enter words manually or upload a text file, then generate metadata with AI.</p>
        </header>

        {/* Input area */}
        <div className={styles.inputSection}>
          <div className={styles.textareaWrap}>
            <textarea
              className={styles.wordsInput}
              rows={5}
              placeholder={"Enter words (one per line or comma-separated):\nubiquitous\nsuperficial\nfacetious, gregarious"}
              value={words}
              onChange={e => setWords(e.target.value)}
            />
          </div>
          <div className={styles.inputActions}>
            <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>
              <Upload size={14} /> Upload .txt
            </button>
            <input ref={fileRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFile} />
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!words.trim() || status === 'generating'}
            >
              {status === 'generating'
                ? <><Loader size={14} className={styles.spin} /> Generating...</>
                : '✦ Generate with AI'
              }
            </button>
          </div>
        </div>

        {/* Status messages */}
        {status === 'error' && (
          <div className={styles.errorBanner}>
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {status === 'done' && (
          <div className={styles.successBanner}>
            <CheckCircle size={15} /> {savedCount} words saved to Notion!
          </div>
        )}

        {/* Vocab cards */}
        {vocabs.length > 0 && (
          <div className={styles.cards}>
            <div className={styles.cardsHeader}>
              <span className={styles.cardsCount}>{vocabs.length} words to add</span>
              <button className={styles.addBlank} onClick={handleAddBlank}>
                <Plus size={14} /> Add blank
              </button>
            </div>
            {vocabs.map((v, i) => (
              <VocabCard key={i} vocab={v} index={i} onChange={handleVocabChange} onRemove={handleRemove} />
            ))}
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={status === 'saving'}
            >
              {status === 'saving'
                ? <><Loader size={15} className={styles.spin} /> Saving to Notion...</>
                : <><CheckCircle size={15} /> Save all to Notion</>
              }
            </button>
          </div>
        )}

        {vocabs.length === 0 && status !== 'generating' && (
          <button className={styles.addBlankLarge} onClick={handleAddBlank}>
            <Plus size={16} /> Add word manually
          </button>
        )}
      </div>
    </div>
  )
}
