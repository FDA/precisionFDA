import { useRef, useEffect } from 'react'

export function useOnOutsideClickRef<T extends Element = HTMLDivElement>(
  shouldListenForOutsideClick: boolean,
  cb: () => void,
  ignoredRef?: React.RefObject<HTMLElement|null>,
): React.RefObject<T|null> {
  const node = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ignoredRef?.current && ignoredRef.current.contains(e.target as Node)) {
        // Click on the ignored element (e.g., toggle button)
        return
      }
      if (node.current?.contains(e.target as Node)) {
        // inside click
        return
      }
      // outside click
      cb()
    }

    if (shouldListenForOutsideClick) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [cb, shouldListenForOutsideClick, ignoredRef])

  return node
}
