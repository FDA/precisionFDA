import React, { createContext, useContext, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { useLocalStorage } from '../hooks/useLocalStorage'

export type Theme = 'light' | 'dark'
type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ColorModeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    'light',
  )

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyM') {
      toggleTheme()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [theme])
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  return <ColorModeContext.Provider value={{ theme, toggleTheme }}><ThemeProvider theme={{ colorMode: theme }}>{children}</ThemeProvider></ColorModeContext.Provider>
}
