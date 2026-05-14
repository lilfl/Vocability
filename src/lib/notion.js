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
    Vocabulary:              extractTitle(p['Vocabulary']),
    POS:                     extractSelect(p['POS']),
    Meaning:                 extractRichText(p['Meaning']),
    JapaneseMeaning:         extractRichText(p['JapaneseMeaning']),
    CoreImage:               extractRichText(p['CoreImage']),
    Example:                 extractRichText(p['Example']),
    Memo:                    extractRichText(p['Memo']),
    Casualness:              extractSelect(p['Casualness']),
    EmotionTags:             extractMultiSelect(p['EmotionTags']),
    Usage:                   extractMultiSelect(p['Usage']),
    NativeFrequency:         extractSelect(p['NativeFrequency']),
    IPA_US:                  extractRichText(p['IPA_US']),
    IPA_UK:                  extractRichText(p['IPA_UK']),
    YouGlish:                extractUrl(p['YouGlish']),
    Synonyms:                extractRichText(p['Synonyms']),
    Paraphrases:             extractRichText(p['Paraphrases']),
    RelatedExpressions:      extractRichText(p['RelatedExpressions']),
    SimilarSpelling:         extractRichText(p['SimilarSpelling']),
    PronunciationConfusions: extractRichText(p['PronunciationConfusions']),
    // SM-2 fields
    sm2_interval:    extractNumber(p['sm2_interval']) ?? 1,
    sm2_repetition:  extractNumber(p['sm2_repetition']) ?? 0,
    sm2_easeFactor:  extractNumber(p['sm2_easeFactor']) ?? 2.5,
    sm2_dueDate:     extractDate(p['sm2_dueDate']) ?? new Date().toISOString().split('T')[0],
  }
}

// Build properties object from vocab for Notion
export function buildNotionProperties(vocab) {
  const props = {}
  const arr2str = (v, sep = ', ') => Array.isArray(v) ? v.join(sep) : (v ?? '')

  if (vocab.Vocabulary             != null) props['Vocabulary']              = titleProp(vocab.Vocabulary)
  if (vocab.POS                    != null) props['POS']                     = selectProp(vocab.POS)
  if (vocab.Meaning                != null) props['Meaning']                 = richTextProp(vocab.Meaning)
  if (vocab.JapaneseMeaning        != null) props['JapaneseMeaning']         = richTextProp(vocab.JapaneseMeaning)
  if (vocab.CoreImage              != null) props['CoreImage']               = richTextProp(vocab.CoreImage)
  if (vocab.Example                != null) props['Example']                 = richTextProp(vocab.Example)
  if (vocab.Memo                   != null) props['Memo']                    = richTextProp(vocab.Memo)
  if (vocab.Casualness             != null) props['Casualness']              = selectProp(vocab.Casualness)
  if (vocab.EmotionTags            != null) props['EmotionTags']             = multiSelectProp(vocab.EmotionTags)
  if (vocab.Usage                  != null) props['Usage']                   = multiSelectProp(vocab.Usage)
  if (vocab.NativeFrequency        != null) props['NativeFrequency']         = selectProp(vocab.NativeFrequency)
  if (vocab.IPA_US                 != null) props['IPA_US']                  = richTextProp(vocab.IPA_US)
  if (vocab.IPA_UK                 != null) props['IPA_UK']                  = richTextProp(vocab.IPA_UK)
  if (vocab.YouGlish               != null) props['YouGlish']                = urlProp(vocab.YouGlish)
  if (vocab.Synonyms               != null) props['Synonyms']                = richTextProp(arr2str(vocab.Synonyms))
  if (vocab.Paraphrases            != null) props['Paraphrases']             = richTextProp(arr2str(vocab.Paraphrases, '\n'))
  if (vocab.RelatedExpressions     != null) props['RelatedExpressions']      = richTextProp(arr2str(vocab.RelatedExpressions, '\n'))
  if (vocab.SimilarSpelling        != null) props['SimilarSpelling']         = richTextProp(arr2str(vocab.SimilarSpelling))
  if (vocab.PronunciationConfusions!= null) props['PronunciationConfusions'] = richTextProp(arr2str(vocab.PronunciationConfusions))
  if (vocab.sm2_interval           != null) props['sm2_interval']            = numberProp(vocab.sm2_interval)
  if (vocab.sm2_repetition         != null) props['sm2_repetition']          = numberProp(vocab.sm2_repetition)
  if (vocab.sm2_easeFactor         != null) props['sm2_easeFactor']          = numberProp(vocab.sm2_easeFactor)
  if (vocab.sm2_dueDate            != null) props['sm2_dueDate']             = dateProp(vocab.sm2_dueDate)
  return props
}
