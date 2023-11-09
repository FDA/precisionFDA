import { useEffect } from 'react'
import { ResourceScope } from './types'

export const useEmmitScope = (scope: ResourceScope, setterFn?: (scope: ResourceScope) => void) => {
  useEffect(() => {
    if (setterFn) {
      setterFn(scope)
    }
  }, [scope, setterFn])
}
