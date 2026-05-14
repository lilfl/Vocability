import { createContext, useContext, useState } from 'react'
import type { Vocab } from '../types'

interface AddPageContextValue {
  words: string
  setWords: React.Dispatch<React.SetStateAction<string>>
  vocabs: Vocab[]
  setVocabs: React.Dispatch<React.SetStateAction<Vocab[]>>
}

const AddPageContext = createContext<AddPageContextValue | null>(null)

export function AddPageProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState('')
  const [vocabs, setVocabs] = useState<Vocab[]>([])

  return (
    <AddPageContext.Provider value={{ words, setWords, vocabs, setVocabs }}>
      {children}
    </AddPageContext.Provider>
  )
}

export function useAddPage(): AddPageContextValue {
  const ctx = useContext(AddPageContext)
  if (!ctx) throw new Error('useAddPage must be used within AddPageProvider')
  return ctx
}
