export interface Vocab {
  id: string
  Vocabulary: string
  POS: string | null
  Meaning: string
  JapaneseMeaning: string
  CoreImage: string
  Example: string
  Memo: string
  Casualness: string | null
  EmotionTags: string[]
  Usage: string[]
  NativeFrequency: string | null
  IPA_US: string
  IPA_UK: string
  YouGlish: string | null
  Synonyms: string
  Paraphrases: string
  RelatedExpressions: string
  SimilarSpelling: string
  PronunciationConfusions: string
  sm2_interval: number
  sm2_repetition: number
  sm2_easeFactor: number
  sm2_dueDate: string
}

export interface SM2Card {
  sm2_interval: number
  sm2_repetition: number
  sm2_easeFactor: number
  sm2_dueDate: string
}

export interface PersonaProfile {
  Nickname: string
  Gender: string
  Occupation: string
  Hobbies: string
  FrequentPlaces: string
  Routine: string
  Services: string
  Devices: string
  Interests: string
}

export interface PersonaPerson {
  Nickname: string
  Gender: string
  Relationship: string
  Occupation: string
  Hobbies: string
}

export interface Persona {
  Profile: PersonaProfile
  Family: PersonaPerson[]
  Friends: PersonaPerson[]
  PeopleAround: PersonaPerson[]
}

export interface AppSettings {
  notionToken?: string
  notionDbId?: string
  openaiKey?: string
  personaContext?: Persona | string
}
