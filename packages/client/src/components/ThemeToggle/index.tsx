import React from 'react'
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react'
import { ThemePreference, useTheme } from '@/utils/ThemeContext'
import styles from './ThemeToggle.module.css'

interface ThemeToggleProps {
  className?: string
}

const themeOptions: { value: ThemePreference; icon: LucideIcon; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light mode' },
  { value: 'dark', icon: Moon, label: 'Dark mode' },
  { value: 'system', icon: Monitor, label: 'System preference' },
]

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`${styles.toggle} ${className ?? ''}`} role="group" aria-label="Theme selection">
      {themeOptions.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          data-active={theme === value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle
