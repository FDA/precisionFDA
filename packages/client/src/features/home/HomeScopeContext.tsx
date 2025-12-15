import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState } from 'react'
import { useLocation } from 'react-router'
import { HomeScope, ServerScope } from './types'
import { getHomeScopeFromServerScope } from './getHomeScopeFromServerScope'

export interface HomeScopeContextValue {
  isHome: boolean
  homeScope?: HomeScope
  setDisplayScope: (rs: ServerScope, featured?: boolean) => void
}

export const defaultHomeContext: HomeScopeContextValue = { 
  isHome: false, 
  setDisplayScope: () => {}, 
  homeScope: undefined
}

const HomeScopeContext = createContext<HomeScopeContextValue>(defaultHomeContext)

export interface HomeScopeProviderProps {
  children: ReactNode
}

export const HomeScopeProvider = ({ children }: HomeScopeProviderProps) => {
  const location = useLocation()
  
  // State for display scope (used on show pages where we don't want URL params)
  const [displayScope, setDisplayScopeState] = useState<HomeScope | undefined>(undefined)
  
  // Read directly from location.search for the most current value
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  
  const scopeParam = searchParams.get('scope') as HomeScope | undefined
  
  // Use displayScope if set, otherwise fall back to URL param
  // Reset displayScope when URL param changes (navigating to list page)
  const homeScope = scopeParam ?? displayScope ?? undefined

  // Handler to set display scope without modifying URL (for show pages)
  const setDisplayScope = useCallback((newScope: ServerScope, featured?: boolean) => {
    const targetScope = getHomeScopeFromServerScope(newScope, featured)
    setDisplayScopeState(targetScope)
  }, [])

  const value: HomeScopeContextValue = {
    isHome: true,
    homeScope,
    setDisplayScope,
  }

  return <HomeScopeContext.Provider value={value}>{children}</HomeScopeContext.Provider>
}

export const useHomeScope = (): HomeScopeContextValue => {
  const context = useContext(HomeScopeContext)
  return context
}
