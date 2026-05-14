import { useState, useRef } from 'react'
import { useSettings } from '../lib/SettingsContext'
import { useAddPage } from '../lib/AddPageContext'
import { generateVocabMetadata } from '../lib/openai'
import { createPage, buildNotionProperties } from '../lib/notion'
import type { Vocab } from '../types'
import { Upload, Plus, X, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import styles from './AddPage.module.css'

const POS_OPTIONS = ['Noun','Verb','Adjective','Adverb','Pronoun','Preposition','Conjunction','Interjection','Determiner','ModalVerb','PhrasalVerb','Expression','Idiom','Sentence']
const CASUAL_OPTIONS = ['VeryFormal','Formal','Neutral','Casual','VeryCasual','Slang']
const FREQ_OPTIONS = ['VeryCommon','Common','Uncommon','Rare']
const USAGE_OPTIONS = ['Spoken','Written','Online','Business','Academic','Literary']
const EMOTION_OPTIONS = ['Positive','Negative','Friendly','Polite','Aggressive','Emotional','Encouraging','Humorous','Sarcastic','Romantic','Apologetic','Excited','Professional']

interface VocabCardProps {
  vocab: Vocab
  index: number
  onChange: (index: number, updated: Vocab) => void
  onRemove: (index: number) => void
}

function VocabCard({ vocab, index, onChange, onRemove }: VocabCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleField = <K extends keyof Vocab>(field: K, value: Vocab[K]) => {
    onChange(index, { ...vocab, [field]: value })
  }

  const toggleMulti = (field: 'EmotionTags' | 'Usage', value: string) => {
    const arr = vocab[field] ?? []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    handleField(field, next)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.cardWord}>{vocab.Vocabulary || `Word ${index + 1}`}</span>
          {vocab.POS && <span className="tag tag--pos">{vocab.POS}</span>}
          {vocab.NativeFrequency && <span className={`tag tag--freq-${vocab.NativeFrequency}`}>{vocab.NativeFrequency}</span>}
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
            <input className={styles.input} value={vocab.Vocabulary} onChange={e => handleField('Vocabulary', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>POS</label>
            <select className={styles.select} value={vocab.POS ?? ''} onChange={e => handleField('POS', e.target.value || null)}>
              <option value="">—</option>
              {POS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Meaning (English)</label>
            <textarea className={styles.textarea} rows={2} value={vocab.Meaning} onChange={e => handleField('Meaning', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Japanese Meaning *</label>
            <textarea className={styles.textarea} rows={2} value={vocab.JapaneseMeaning} onChange={e => handleField('JapaneseMeaning', e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Example</label>
          <textarea className={styles.textarea} rows={3} value={vocab.Example} onChange={e => handleField('Example', e.target.value)} placeholder={"English sentence\n日本語訳"} />
        </div>

        {expanded && (
          <>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>IPA (US)</label>
                <input className={styles.input} value={vocab.IPA_US} onChange={e => handleField('IPA_US', e.target.value)} placeholder="/wɜːrd/" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>IPA (UK)</label>
                <input className={styles.input} value={vocab.IPA_UK} onChange={e => handleField('IPA_UK', e.target.value)} placeholder="/wɜːd/" />
              </div>
            </div>

            <div className={styles.selectGrid}>
              {([['Casualness', CASUAL_OPTIONS], ['NativeFrequency', FREQ_OPTIONS]] as [keyof Vocab, string[]][]).map(([field, opts]) => (
                <div key={String(field)} className={styles.field}>
                  <label className={styles.label}>{String(field)}</label>
                  <select className={styles.select} value={(vocab[field] as string) ?? ''} onChange={e => handleField(field, (e.target.value || null) as never)}>
                    <option value="">—</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Usage</label>
              <div className={styles.chips}>
                {USAGE_OPTIONS.map(o => (
                  <button key={o} type="button"
                    className={`${styles.chip} ${vocab.Usage.includes(o) ? styles.chipActive : ''}`}
                    onClick={() => toggleMulti('Usage', o)}>{o}</button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Emotion Tags</label>
              <div className={styles.chips}>
                {EMOTION_OPTIONS.map(o => (
                  <button key={o} type="button"
                    className={`${styles.chip} ${vocab.EmotionTags.includes(o) ? styles.chipEmotionActive : ''}`}
                    onClick={() => toggleMulti('EmotionTags', o)}>{o}</button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Core Image</label>
              <textarea className={styles.textarea} rows={2} value={vocab.CoreImage} onChange={e => handleField('CoreImage', e.target.value)} />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Synonyms</label>
                <input className={styles.input} value={vocab.Synonyms} onChange={e => handleField('Synonyms', e.target.value)} placeholder="quit, abandon, drop" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Similar Spelling</label>
                <input className={styles.input} value={vocab.SimilarSpelling} onChange={e => handleField('SimilarSpelling', e.target.value)} />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Paraphrases</label>
                <textarea className={styles.textarea} rows={3} value={vocab.Paraphrases} onChange={e => handleField('Paraphrases', e.target.value)} placeholder="one per line" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Related Expressions</label>
                <textarea className={styles.textarea} rows={3} value={vocab.RelatedExpressions} onChange={e => handleField('RelatedExpressions', e.target.value)} placeholder="one per line" />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Pronunciation Confusions</label>
                <input className={styles.input} value={vocab.PronunciationConfusions} onChange={e => handleField('PronunciationConfusions', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Memo</label>
                <input className={styles.input} value={vocab.Memo} onChange={e => handleField('Memo', e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>YouGlish URL</label>
              <input className={styles.input} value={vocab.YouGlish ?? ''} onChange={e => handleField('YouGlish', e.target.value || null)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const BLANK_VOCAB = (): Vocab => ({
  id: '',
  Vocabulary: '', Meaning: '', JapaneseMeaning: '', Example: '',
  POS: null, Casualness: 'Neutral', NativeFrequency: 'Common',
  Usage: [], EmotionTags: [], CoreImage: '',
  Synonyms: '', Paraphrases: '', RelatedExpressions: '',
  SimilarSpelling: '', PronunciationConfusions: '',
  IPA_US: '', IPA_UK: '', YouGlish: null, Memo: '',
  sm2_interval: 1, sm2_repetition: 0, sm2_easeFactor: 2.5,
  sm2_dueDate: new Date().toISOString().split('T')[0],
})

type Status = 'generating' | 'saving' | 'done' | 'error' | null

export default function AddPage() {
  const { settings } = useSettings()
  const { words, setWords, vocabs, setVocabs } = useAddPage()
  const [status, setStatus] = useState<Status>(null)
  const [error, setError] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setWords((ev.target?.result as string) ?? '')
    reader.readAsText(file)
  }

  const parseWords = (text: string): string[] =>
    text.split(/[\n,]+/).map(w => w.trim()).filter(Boolean)

  const hasNonEnglish = (word: string): boolean => /[　-鿿豈-﫿＀-￯]/.test(word)

  const handleGenerate = async () => {
    const wordList = parseWords(words)
    if (!wordList.length) return

    const invalidWords = wordList.filter(hasNonEnglish)
    if (invalidWords.length > 0) {
      setError(`日本語・記号など英語以外の文字が含まれています: ${invalidWords.join(', ')}`)
      setStatus('error')
      return
    }

    if (!settings.openaiKey) {
      setError('OpenAI API Key is not set. Go to Settings.')
      setStatus('error')
      return
    }

    setStatus('generating')
    setError('')
    try {
      const results = await generateVocabMetadata(settings.openaiKey, wordList, settings.personaContext)
      setVocabs(results)
      setStatus(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  const handleVocabChange = (index: number, updated: Vocab) => {
    setVocabs(v => v.map((item, i) => i === index ? updated : item))
  }

  const handleRemove = (index: number) => {
    setVocabs(v => v.filter((_, i) => i !== index))
  }

  const handleAddBlank = () => {
    setVocabs(v => [...v, BLANK_VOCAB()])
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
      setError(err instanceof Error ? err.message : String(err))
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
            <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
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

        {vocabs.length > 0 && (
          <div className={styles.cards}>
            <div className={styles.cardsHeader}>
              <span className={styles.cardsCount}>{vocabs.length} entries to add</span>
              <button className={styles.addBlank} onClick={handleAddBlank}>
                <Plus size={14} /> Add blank
              </button>
            </div>
            {vocabs.map((v, i) => (
              <VocabCard key={i} vocab={v} index={i} onChange={handleVocabChange} onRemove={handleRemove} />
            ))}
            <button className={styles.saveBtn} onClick={handleSave} disabled={status === 'saving'}>
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
