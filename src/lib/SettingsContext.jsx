import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vocability_settings') || '{}')
    } catch {
      return {}
    }
  })

  const updateSettings = (updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('vocability_settings', JSON.stringify(next))
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
