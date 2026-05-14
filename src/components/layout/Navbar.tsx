import { NavLink } from 'react-router-dom'
import { BookOpen, PlusCircle, Settings } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        <span className={styles.logoText}>Vocability</span>
      </NavLink>
      <nav className={styles.nav}>
        <NavLink to="/quiz" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <BookOpen size={16} />
          Quiz
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <PlusCircle size={16} />
          Add
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <Settings size={16} />
          Settings
        </NavLink>
      </nav>
    </header>
  )
}
