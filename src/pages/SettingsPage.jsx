import { useState } from 'react'
import { useSettings } from '../lib/SettingsContext'
import { Save, Eye, EyeOff, CheckCircle, Plus, X } from 'lucide-react'
import styles from './SettingsPage.module.css'

const MAX_PEOPLE = 2

const GENDER_OPTIONS = ['', '男', '女', 'その他']

const DEFAULT_PERSONA = {
  Profile: {
    Nickname: '', Gender: '', Occupation: '', Hobbies: '',
    FrequentPlaces: '', Routine: '', Services: '', Devices: '', Interests: '',
  },
  Family: [],
  Friends: [],
  PeopleAround: [],
}

const BLANK_PERSON = { Nickname: '', Gender: '', Relationship: '', Occupation: '', Hobbies: '' }

function parsePersona(raw) {
  if (raw && typeof raw === 'object' && 'Profile' in raw) return raw
  return DEFAULT_PERSONA
}

const GROUP_LABELS = {
  Family: '家族',
  Friends: '友人',
  PeopleAround: '周りの人',
}

const RELATIONSHIP_HINTS = {
  Family: '例：母、父、兄',
  Friends: '例：高校の友達、恋人',
  PeopleAround: '例：上司、同僚',
}

function PersonGroup({ group, people, onChange }) {
  const label = GROUP_LABELS[group]
  const relHint = RELATIONSHIP_HINTS[group]

  const add = () => onChange([...people, { ...BLANK_PERSON }])
  const remove = (i) => onChange(people.filter((_, idx) => idx !== i))
  const update = (i, key, val) =>
    onChange(people.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  return (
    <div className={styles.personaSubSection}>
      <div className={styles.personaSubHeader}>
        <span className={styles.personaSubTitle}>{label}</span>
        {people.length < MAX_PEOPLE && (
          <button className={styles.addPersonBtn} onClick={add} type="button">
            <Plus size={12} /> 追加
          </button>
        )}
      </div>

      {people.length === 0 && (
        <p className={styles.emptyList}>登録なし</p>
      )}

      {people.map((person, i) => (
        <div key={i} className={styles.personCard}>
          <div className={styles.personCardHeader}>
            <span className={styles.personCardName}>
              {person.Nickname || `${label} ${i + 1}`}
            </span>
            <button className={styles.removePersonBtn} onClick={() => remove(i)} type="button">
              <X size={14} />
            </button>
          </div>
          <div className={styles.personCardGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Nickname</label>
              <input className={styles.input} value={person.Nickname} onChange={e => update(i, 'Nickname', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gender</label>
              <select className={styles.select} value={person.Gender} onChange={e => update(i, 'Gender', e.target.value)}>
                {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Relationship</label>
              <input className={styles.input} placeholder={relHint} value={person.Relationship} onChange={e => update(i, 'Relationship', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Occupation</label>
              <input className={styles.input} value={person.Occupation} onChange={e => update(i, 'Occupation', e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Hobbies</label>
              <input className={styles.input} value={person.Hobbies} onChange={e => update(i, 'Hobbies', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({
    notionToken: settings.notionToken || '',
    notionDbId: settings.notionDbId || '',
    openaiKey: settings.openaiKey || '',
  })
  const [persona, setPersona] = useState(() => parsePersona(settings.personaContext))
  const [show, setShow] = useState({ notionToken: false, openaiKey: false })
  const [saved, setSaved] = useState(false)

  const updateProfile = (key, val) =>
    setPersona(p => ({ ...p, Profile: { ...p.Profile, [key]: val } }))

  const updateGroup = (group, people) =>
    setPersona(p => ({ ...p, [group]: people }))

  const handleSave = () => {
    updateSettings({ ...form, personaContext: persona })
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

        {/* Notion */}
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

        {/* OpenAI */}
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

        {/* Persona */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Persona</h2>
          <p className={styles.hint}>AIが例文を生成する際に参照するプロフィールです。入力した情報ほど自分に合った例文が生成されます。</p>

          {/* Profile */}
          <div className={styles.personaSubSection}>
            <span className={styles.personaSubTitle}>本人のプロフィール</span>
            <div className={styles.profileGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Nickname</label>
                <input className={styles.input} value={persona.Profile.Nickname} onChange={e => updateProfile('Nickname', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gender</label>
                <select className={styles.select} value={persona.Profile.Gender} onChange={e => updateProfile('Gender', e.target.value)}>
                  {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Occupation</label>
                <input className={styles.input} placeholder="例：エンジニア、学生" value={persona.Profile.Occupation} onChange={e => updateProfile('Occupation', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Hobbies</label>
                <input className={styles.input} placeholder="例：ドライブ、カフェ巡り" value={persona.Profile.Hobbies} onChange={e => updateProfile('Hobbies', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>FrequentPlaces</label>
                <input className={styles.input} placeholder="例：カフェ、ジム" value={persona.Profile.FrequentPlaces} onChange={e => updateProfile('FrequentPlaces', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Routine</label>
                <input className={styles.input} placeholder="例：朝の勉強、SNSチェック" value={persona.Profile.Routine} onChange={e => updateProfile('Routine', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Services</label>
                <input className={styles.input} placeholder="例：Instagram、YouTube" value={persona.Profile.Services} onChange={e => updateProfile('Services', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Devices</label>
                <input className={styles.input} placeholder="例：iPhone、Mac" value={persona.Profile.Devices} onChange={e => updateProfile('Devices', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Interests</label>
                <input className={styles.input} placeholder="例：ホラー映画、Hiphop、アニメ" value={persona.Profile.Interests} onChange={e => updateProfile('Interests', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Family / Friends / PeopleAround */}
          {['Family', 'Friends', 'PeopleAround'].map(group => (
            <PersonGroup
              key={group}
              group={group}
              people={persona[group]}
              onChange={people => updateGroup(group, people)}
            />
          ))}
        </section>

        <button className={`${styles.saveBtn} ${saved ? styles.saved : ''}`} onClick={handleSave}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  )
}
