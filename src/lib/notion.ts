import type { Vocab } from '../types'

const BASE = '/notion-api/v1'

type NotionProp = Record<string, unknown> | undefined

function notionHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }
}

export async function queryDatabase(
  token: string,
  databaseId: string,
  filter?: unknown,
  sorts?: unknown,
  startCursor?: string
): Promise<{ results: Record<string, unknown>[]; has_more: boolean; next_cursor: string | null }> {
  const body: Record<string, unknown> = {}
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

export async function createPage(
  token: string,
  databaseId: string,
  properties: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${BASE}/pages`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion create failed: ${res.status} ${err}`)
  }
  return res.json()
}

export async function updatePage(
  token: string,
  pageId: string,
  properties: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  })
  if (!res.ok) throw new Error(`Notion update failed: ${res.status}`)
  return res.json()
}

// ── Property helpers ──────────────────────────────────────────────

export function extractTitle(prop: NotionProp): string {
  const p = prop as { title?: { plain_text: string }[] } | undefined
  return p?.title?.map(t => t.plain_text).join('') ?? ''
}

export function extractRichText(prop: NotionProp): string {
  const p = prop as { rich_text?: { plain_text: string }[] } | undefined
  return p?.rich_text?.map(t => t.plain_text).join('') ?? ''
}

export function extractSelect(prop: NotionProp): string | null {
  const p = prop as { select?: { name: string } | null } | undefined
  return p?.select?.name ?? null
}

export function extractMultiSelect(prop: NotionProp): string[] {
  const p = prop as { multi_select?: { name: string }[] } | undefined
  return p?.multi_select?.map(s => s.name) ?? []
}

export function extractNumber(prop: NotionProp): number | null {
  const p = prop as { number?: number | null } | undefined
  return p?.number ?? null
}

export function extractDate(prop: NotionProp): string | null {
  const p = prop as { date?: { start: string } | null } | undefined
  return p?.date?.start ?? null
}

export function extractUrl(prop: NotionProp): string | null {
  const p = prop as { url?: string | null } | undefined
  return p?.url ?? null
}

export function titleProp(value: string): unknown {
  return { title: [{ text: { content: value ?? '' } }] }
}

export function richTextProp(value: string): unknown {
  return { rich_text: [{ text: { content: value ?? '' } }] }
}

export function selectProp(value: string | null): unknown {
  return value ? { select: { name: value } } : { select: null }
}

export function multiSelectProp(values: string[]): unknown {
  return { multi_select: (values ?? []).map(v => ({ name: v })) }
}

export function numberProp(value: number | null): unknown {
  return { number: value ?? null }
}

export function dateProp(value: string | null): unknown {
  return value ? { date: { start: value } } : { date: null }
}

export function urlProp(value: string | null): unknown {
  return { url: value ?? null }
}

export function parseVocabPage(page: Record<string, unknown>): Vocab {
  const p = (page.properties ?? {}) as Record<string, NotionProp>
  return {
    id: page.id as string,
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
    sm2_interval:    extractNumber(p['sm2_interval']) ?? 1,
    sm2_repetition:  extractNumber(p['sm2_repetition']) ?? 0,
    sm2_easeFactor:  extractNumber(p['sm2_easeFactor']) ?? 2.5,
    sm2_dueDate:     extractDate(p['sm2_dueDate']) ?? new Date().toISOString().split('T')[0],
  }
}

export function buildNotionProperties(vocab: Partial<Vocab>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  const arr2str = (v: string | string[] | null | undefined, sep = ', '): string =>
    Array.isArray(v) ? v.join(sep) : (v ?? '')

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
