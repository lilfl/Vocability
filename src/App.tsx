import { Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './lib/SettingsContext'
import { AddPageProvider } from './lib/AddPageContext'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import AddPage from './pages/AddPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <AddPageProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AddPageProvider>
    </SettingsProvider>
  )
}
