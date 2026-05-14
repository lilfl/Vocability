import { useState } from 'react'
import { useSettings } from '../lib/SettingsContext'
import { Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({
    notionToken: settings.notionToken || '',
    notionDbId: settings.notionDbId || '',
    openaiKey: settings.openaiKey || '',
    personaContext: settings.personaContext || '',
  })
  const [show, setShow] = useState({ notionToken: false, openaiKey: false })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>API keys are stored locally in your browser only.</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notion</h2>
          <div className={styles.field}>
            <label className={styles.label}>Integration Token</label>
            <div className={styles.inputWrap}>
              <input
                type={show.notionToken ? 'text' : 'password'}
                className={styles.input}
                placeholder="secret_..."
                value={form.notionToken}
                onChange={e => setForm(f => ({ ...f, notionToken: e.target.value }))}
              />
              <button className={styles.eye} onClick={() => setShow(s => ({ ...s, notionToken: !s.notionToken }))}>
                {show.notionToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Database ID</label>
            <input
              type="text"
              className={styles.input}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={form.notionDbId}
              onChange={e => setForm(f => ({ ...f, notionDbId: e.target.value }))}
            />
            <p className={styles.hint}>The 32-character ID from your Notion database URL.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>OpenAI</h2>
          <div className={styles.field}>
            <label className={styles.label}>API Key</label>
            <div className={styles.inputWrap}>
              <input
                type={show.openaiKey ? 'text' : 'password'}
                className={styles.input}
                placeholder="sk-..."
                value={form.openaiKey}
                onChange={e => setForm(f => ({ ...f, openaiKey: e.target.value }))}
              />
              <button className={styles.eye} onClick={() => setShow(s => ({ ...s, openaiKey: !s.openaiKey }))}>
                {show.openaiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Persona Context</h2>
          <div className={styles.field}>
            <label className={styles.label}>Learner Profile</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="e.g. Japanese software engineer, mid-level English proficiency, preparing for business meetings in the US."
              value={form.personaContext}
              onChange={e => setForm(f => ({ ...f, personaContext: e.target.value }))}
            />
            <p className={styles.hint}>Passed to AI when generating vocabulary metadata. Helps tailor examples to your background.</p>
          </div>
        </section>

        <button className={`${styles.saveBtn} ${saved ? styles.saved : ''}`} onClick={handleSave}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  )
}
