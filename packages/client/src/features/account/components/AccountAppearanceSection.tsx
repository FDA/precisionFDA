import { Monitor, Moon, Sun } from 'lucide-react'
import type React from 'react'
import { type ThemePreference, useTheme } from '@/utils/ThemeContext'

const themeOptions: { value: ThemePreference; icon: React.ReactNode; label: string; description: string }[] = [
  { value: 'light', icon: <Sun size={20} />, label: 'Light', description: 'Always use light mode' },
  { value: 'dark', icon: <Moon size={20} />, label: 'Dark', description: 'Always use dark mode' },
  { value: 'system', icon: <Monitor size={20} />, label: 'System', description: 'Match your device settings' },
]

export function AccountAppearanceSection(): React.ReactElement {
  const { theme, setTheme } = useTheme()

  return (
    <section className="flex flex-col gap-4 border-t border-(--c-layout-border) pt-4">
      <h2 className="m-0 text-lg font-semibold text-(--c-text-700)">Appearance</h2>
      <p className="m-0 text-sm text-(--c-text-500)">Choose how precisionFDA looks to you. Select a theme preference.</p>

      <div className="mt-2 flex flex-wrap gap-4">
        {themeOptions.map(({ value, icon, label, description }) => (
          <button
            type="button"
            key={value}
            className={`flex min-w-[140px] cursor-pointer flex-col items-center gap-2 rounded-lg border-2 bg-background px-6 py-5 transition-colors duration-150 ${
              theme === value
                ? 'border-(--primary-500) bg-(--primary-50)'
                : 'border-(--c-layout-border) hover:border-(--c-text-400)'
            }`}
            onClick={() => setTheme(value)}
            aria-pressed={theme === value}
          >
            <span
              className={`flex size-10 items-center justify-center rounded-full ${
                theme === value
                  ? 'bg-(--primary-100) text-(--primary-600)'
                  : 'bg-(--c-layout-bg-secondary) text-(--c-text-600)'
              }`}
            >
              {icon}
            </span>
            <span className="text-sm font-semibold text-(--c-text-700)">{label}</span>
            <span className="text-center text-xs text-(--c-text-500)">{description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
