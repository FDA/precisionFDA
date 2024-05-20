import { useEffect } from 'react'
import { HomeScope } from './types'

export const useEmmitScope = (homeScope: HomeScope, setterFn?: (homeScope: HomeScope) => void) => {
  useEffect(() => {
    if (setterFn) {
      setterFn(homeScope)
    }
  }, [homeScope, setterFn])
}
