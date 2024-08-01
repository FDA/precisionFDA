import React, { ReactNode, useContext } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { siteNavItems } from './NavItems'

export type NavOrderConextType = {
  order: string[]
  setOrder: (sel: string[]) => void
}

const NavOrderContext = React.createContext<NavOrderConextType | undefined>(undefined)

export function NavOrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useLocalStorage<string[]>('navOrder', siteNavItems.map(i => i.id), 'localStorage')

  return (
    <NavOrderContext.Provider value={{ order, setOrder }}>
      {children}
    </NavOrderContext.Provider>
  )
}

export const useNavOrderLocalStorage = () => {
  const context = useContext(NavOrderContext)
  if (context === undefined) {
    throw new Error('useNavOrderLocalStorage must be used within a NavOrderProvider')
  }
  return context
}
