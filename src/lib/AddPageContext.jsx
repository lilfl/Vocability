import { createContext, useContext, useState } from 'react'

const AddPageContext = createContext(null)

export function AddPageProvider({ children }) {
  const [words, setWords] = useState('')
  const [vocabs, setVocabs] = useState([])

  return (
    <AddPageContext.Provider value={{ words, setWords, vocabs, setVocabs }}>
      {children}
    </AddPageContext.Provider>
  )
}

export const useAddPage = () => useContext(AddPageContext)
