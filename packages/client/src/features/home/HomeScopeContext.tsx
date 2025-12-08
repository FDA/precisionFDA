import React, { createContext, useContext, ReactNode, useMemo, useCallback, useRef, startTransition } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { HomeScope, ServerScope } from './types'
import { getHomeScopeFromServerScope } from './getHomeScopeFromServerScope'

export interface HomeScopeContextValue {
  isHome: boolean
  homeScope?: HomeScope
  homeScopeChangeHandler: (rs: ServerScope, featured?: boolean) => void
}

export const defaultHomeContext: HomeScopeContextValue = { 
  isHome: false, 
  homeScopeChangeHandler: () => {}, 
  homeScope: undefined 
}

const HomeScopeContext = createContext<HomeScopeContextValue | undefined>(defaultHomeContext)

export interface HomeScopeProviderProps {
  children: ReactNode
}

export const HomeScopeProvider = ({ children }: HomeScopeProviderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const lastScopeRef = useRef<HomeScope | undefined>(undefined)
  
  // Read directly from location.search for the most current value
  // This avoids stale values during navigation in React Router v7
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  
  const scopeParam = searchParams.get('scope') as HomeScope | undefined
  const homeScope = scopeParam ?? undefined
  
  // Update ref with current scope
  lastScopeRef.current = homeScope

  const homeScopeChangeHandler = useCallback((newScope: ServerScope, featured?: boolean) => {
    const targetScope = getHomeScopeFromServerScope(newScope, featured)
    
    // Use startTransition to prevent race conditions
    startTransition(() => {
      // Read current URL at call time, not from closure
      const currentUrl = new URL(window.location.href)
      const newSearchParams = new URLSearchParams(currentUrl.search)
      newSearchParams.set('scope', targetScope)
      navigate(`${currentUrl.pathname}?${newSearchParams.toString()}`, { replace: true })
    })
  }, [navigate])

  const value: HomeScopeContextValue = {
    isHome: true,
    homeScope,
    homeScopeChangeHandler,
  }

  return <HomeScopeContext.Provider value={value}>{children}</HomeScopeContext.Provider>
}

export const useHomeScope = (): HomeScopeContextValue => {
  const context = useContext(HomeScopeContext)
  if (context === undefined) {
    throw new Error('useHomeScope must be used within a HomeScopeProvider')
  }
  return context
}
