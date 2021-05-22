import { useRef, useEffect } from 'react'

export const useOnOutsideClickRef = (
  shouldListenForOutsideClick: boolean,
  cb: (isClickedOutside: boolean) => void
) => {
  const node: any = useRef()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
  }, [cb, shouldListenForOutsideClick])

  return node
}
