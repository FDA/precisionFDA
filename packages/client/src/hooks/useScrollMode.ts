import { useLayoutEffect } from 'react'

type ScrollMode = 'main' | 'inner'

/**
 * Adds scroll mode class to html element for scroll behavior styles.
 * Uses useLayoutEffect to ensure styles are applied before paint.
 */
export function useScrollMode(mode: ScrollMode | null): void {
  useLayoutEffect(() => {
    if (!mode) return

    const className = `scroll-${mode}`
    document.documentElement.classList.add(className)
    
    return () => {
      document.documentElement.classList.remove(className)
    }
  }, [mode])
}
