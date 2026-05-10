// Notion API client via Vite proxy (/notion-api → https://api.notion.com)

const BASE = '/notion-api/v1'

function notionHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }
}

export async function queryDatabase(token, databaseId, filter, sorts, startCursor) {
  const body = {}
  if (filter) body.filter = filter
  if (sorts) body.sorts = sorts
  if (startCursor) body.start_cursor = startCursor

  const res = await fetch(`${BASE}/databases/${databaseId}/query`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`)
  return res.json()
}

export async function createPage(token, databaseId, properties) {
  const res = await fetch(`${BASE}/pages`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion create failed: ${res.status} ${err}`)
  }
  return res.json()
}

export async function updatePage(token, pageId, properties) {
  const res = await fetch(`${BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  })
  if (!res.ok) throw new Error(`Notion update failed: ${res.status}`)
  return res.json()
}

// ── Property helpers ──────────────────────────────────────────────

export function extractTitle(prop) {
  return prop?.title?.map(t => t.plain_text).join('') ?? ''
}

export function extractRichText(prop) {
  return prop?.rich_text?.map(t => t.plain_text).join('') ?? ''
}

export function extractSelect(prop) {
  return prop?.select?.name ?? null
}

export function extractMultiSelect(prop) {
  return prop?.multi_select?.map(s => s.name) ?? []
}

export function extractNumber(prop) {
  return prop?.number ?? null
}

export function extractDate(prop) {
  return prop?.date?.start ?? null
}

export function extractUrl(prop) {
  return prop?.url ?? null
}

// Build Notion property objects for create/update
export function titleProp(value) {
  return { title: [{ text: { content: value ?? '' } }] }
}

export function richTextProp(value) {
  return { rich_text: [{ text: { content: value ?? '' } }] }
}

export function selectProp(value) {
  return value ? { select: { name: value } } : { select: null }
}

export function multiSelectProp(values) {
  return { multi_select: (values ?? []).map(v => ({ name: v })) }
}

export function numberProp(value) {
  return { number: value ?? null }
}

export function dateProp(value) {
  return value ? { date: { start: value } } : { date: null }
}

export function urlProp(value) {
  return { url: value ?? null }
}

// Parse a full Notion page into a vocab object
export function parseVocabPage(page) {
  const p = page.properties
  return {
    id: page.id,
    Vocabulary:      extractTitle(p['Vocabulary']),
    Meaning:         extractRichText(p['Meaning']),
    Example:         extractRichText(p['Example']),
    Memo:            extractRichText(p['Memo']),
    CoreImage:       extractRichText(p['CoreImage']),
    Phonetic:        extractRichText(p['Phonetic']),
    SimilarSpelling: extractRichText(p['SimilarSpelling']),
    Paraphrase:      extractRichText(p['Paraphrase']),
    AudioURL:        extractUrl(p['AudioURL']),
    Difficulty:      extractSelect(p['Difficulty']),
    POS:             extractSelect(p['POS']),
    Usage:           extractSelect(p['Usage']),
    CasualLevel:     extractSelect(p['CasualLevel']),
    Frequency:       extractSelect(p['Frequency']),
    Type:            extractMultiSelect(p['Type']),
    EmotionTone:     extractMultiSelect(p['Emotion/Tone']),
    // SM-2 fields (stored as numbers in Notion)
    sm2_interval:    extractNumber(p['sm2_interval']) ?? 1,
    sm2_repetition:  extractNumber(p['sm2_repetition']) ?? 0,
    sm2_easeFactor:  extractNumber(p['sm2_easeFactor']) ?? 2.5,
    sm2_dueDate:     extractDate(p['sm2_dueDate']) ?? new Date().toISOString().split('T')[0],
  }
}

// Build properties object from vocab for Notion
export function buildNotionProperties(vocab) {
  const props = {}
  if (vocab.Vocabulary     != null) props['Vocabulary']      = titleProp(vocab.Vocabulary)
  if (vocab.Meaning        != null) props['Meaning']         = richTextProp(vocab.Meaning)
  if (vocab.Example        != null) props['Example']         = richTextProp(vocab.Example)
  if (vocab.Memo           != null) props['Memo']            = richTextProp(vocab.Memo)
  if (vocab.CoreImage      != null) props['CoreImage']       = richTextProp(vocab.CoreImage)
  if (vocab.Phonetic       != null) props['Phonetic']        = richTextProp(vocab.Phonetic)
  if (vocab.SimilarSpelling!= null) props['SimilarSpelling'] = richTextProp(vocab.SimilarSpelling)
  if (vocab.Paraphrase     != null) props['Paraphrase']      = richTextProp(vocab.Paraphrase)
  if (vocab.AudioURL       != null) props['AudioURL']        = urlProp(vocab.AudioURL)
  if (vocab.Difficulty     != null) props['Difficulty']      = selectProp(vocab.Difficulty)
  if (vocab.POS            != null) props['POS']             = selectProp(vocab.POS)
  if (vocab.Usage          != null) props['Usage']           = selectProp(vocab.Usage)
  if (vocab.CasualLevel    != null) props['CasualLevel']     = selectProp(vocab.CasualLevel)
  if (vocab.Frequency      != null) props['Frequency']       = selectProp(vocab.Frequency)
  if (vocab.Type           != null) props['Type']            = multiSelectProp(vocab.Type)
  if (vocab.EmotionTone    != null) props['Emotion/Tone']    = multiSelectProp(vocab.EmotionTone)
  if (vocab.sm2_interval   != null) props['sm2_interval']    = numberProp(vocab.sm2_interval)
  if (vocab.sm2_repetition != null) props['sm2_repetition']  = numberProp(vocab.sm2_repetition)
  if (vocab.sm2_easeFactor != null) props['sm2_easeFactor']  = numberProp(vocab.sm2_easeFactor)
  if (vocab.sm2_dueDate    != null) props['sm2_dueDate']     = dateProp(vocab.sm2_dueDate)
  return props
}
