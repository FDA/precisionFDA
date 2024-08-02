import { useRef, useEffect } from 'react'

export const useOnOutsideClickRef = (
  shouldListenForOutsideClick: boolean,
  cb: (isClickedOutside: boolean) => void,
  ignoredRef?: HTMLDivElement | null,
) => {
  const node = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ignoredRef?.current && ignoredRef.current.contains(e.target)) {
        // Click on the ignored element (e.g., toggle button)
        return
      }
      if (node.current.contains(e.target)) {
        // inside click
        return
      }
      // outside click
      cb(false)
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
