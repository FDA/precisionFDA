import { useRef, useEffect } from 'react'

export const useSkipFirstRenderUseEffect = (fn: () => void, deps: unknown[]) => {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    fn()
  }, deps)
}
