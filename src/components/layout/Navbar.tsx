import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, PlusCircle, Settings, Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/quiz',     icon: <BookOpen size={18} />,  label: 'Quiz' },
  { to: '/add',      icon: <PlusCircle size={18} />, label: 'Add' },
  { to: '/settings', icon: <Settings size={18} />,  label: 'Settings' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo} onClick={close}>
        <span className={styles.logoText}>Vocability</span>
      </NavLink>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            {icon} {label}
          </NavLink>
        ))}
      </nav>

      <button className={styles.hamburger} onClick={() => setOpen(o => !o)} aria-label="Menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`} onClick={close}>
              {icon} {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
