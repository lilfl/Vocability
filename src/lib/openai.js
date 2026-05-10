const BASE = '/openai-api/v1'

const SYSTEM_PROMPT = `You are an expert English lexicographer. Given one or more English vocabulary words/phrases, generate structured metadata for each.

Respond ONLY with a JSON array. Each element must match this schema exactly:
{
  "Vocabulary": string,
  "Meaning": string,           // Japanese meaning/explanation
  "Example": string,           // One natural example sentence
  "Phonetic": string,          // IPA phonetic transcription e.g. /wɜːrd/
  "CoreImage": string,         // Core image/nuance in Japanese (1-2 sentences)
  "Paraphrase": string,        // English paraphrase or synonyms
  "SimilarSpelling": string,   // Comma-separated words with similar spelling (empty if none)
  "AudioURL": string,          // Youglish URL: https://youglish.com/pronounce/WORD/english
  "Difficulty": "Difficult" | "Challenging" | "Normal" | "Easy",
  "POS": "ConjunctionAdverb" | "Sentence" | "Phrase" | "PhrasalVerb" | "Determiner" | "Interjection" | "Conjunction" | "Preposition" | "Adjective" | "Pronoun" | "Noun" | "Adverb" | "ModalVerb" | "Verb",
  "Usage": "Both" | "Spoken" | "Written",
  "CasualLevel": "Slang/VeryInformal" | "Casual" | "Neutral" | "Formal" | "VeryFormal",
  "Frequency": "VeryCommon" | "Common" | "Occasionally" | "Rare",
  "Type": array of zero or more of ["Business","Academic","Literary","Childlike","YouthSlang","OlderAdults","Feminine","Masculine"],
  "EmotionTone": array of zero or more of ["Positive","Negative","Neutral","Humorous","Sarcastic","Polite","Rude","Soft","Harsh","Cute","Serious","Dramatic","Elegant","Aggressive","Warm","Cold"]
}

Return ONLY valid JSON, no markdown, no explanation.`

export async function generateVocabMetadata(apiKey, words) {
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n')

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate metadata for these words:\n${wordList}` },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const text = data.choices[0].message.content
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
