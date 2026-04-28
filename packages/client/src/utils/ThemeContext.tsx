import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { useLocalStorage } from '../hooks/useLocalStorage'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

type ThemeContextType = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  resolvedTheme: Theme
  systemTheme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<ThemePreference>('theme', 'system')
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)

  const resolvedTheme = useMemo<Theme>(
    () => (theme === 'system' ? systemTheme : theme),
    [systemTheme, theme],
  )

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }, [resolvedTheme, setTheme])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyM') {
        toggleTheme()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleTheme])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      toggleTheme,
    }),
    [resolvedTheme, setTheme, systemTheme, theme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={{ colorMode: resolvedTheme }}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

export const ColorModeProvider = ThemeProvider
