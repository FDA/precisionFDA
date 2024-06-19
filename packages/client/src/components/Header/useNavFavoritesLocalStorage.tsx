import React, { ReactNode, useContext } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export type NavFavoritesContextType = {
  selFavorites: string[]
  setSelFavorites: (sel: string[]) => void
}

const NavFavoritesContext = React.createContext<NavFavoritesContextType | undefined>(undefined)

export function NavFavoritesProvider({ children }: { children: ReactNode }) {
  const [selFavorites, setSelFavorites] = useLocalStorage<string[]>(
    'selectedNavFavorites',
    ['home', 'spaces', 'docs'],
    'localStorage',
  )

  return <NavFavoritesContext.Provider value={{ selFavorites, setSelFavorites }}>{children}</NavFavoritesContext.Provider>
}

export const useNavFavoritesLocalStorage = () => {
  const context = useContext(NavFavoritesContext)
  if (context === undefined) {
    throw new Error('useNavFavoritesLocalStorage must be used within a NavFavoritesProvider')
  }
  return context
}
