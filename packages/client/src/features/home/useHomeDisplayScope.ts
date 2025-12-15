import { useEffect } from 'react'
import { ServerScope } from './types'
import { HomeScopeContextValue } from './HomeScopeContext'

export const useHomeDisplayScope = (
  homeContext: HomeScopeContextValue,
  scope?: ServerScope,
  featured?: boolean,
  enabled: boolean = true,
) => {
  const { isHome, setDisplayScope } = homeContext

  useEffect(() => {
    if (!enabled) return
    if (!isHome) return
    if (scope === undefined) return

    setDisplayScope(scope, featured)
  }, [enabled, featured, isHome, scope, setDisplayScope])
}
