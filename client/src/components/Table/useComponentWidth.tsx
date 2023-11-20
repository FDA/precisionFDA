import { debounce } from 'lodash'
import { useState, useRef, useCallback, useEffect } from 'react'


/**
 * Custom hook that tracks and provides the width of a component.
 * 
 * This hook utilizes a ref to a DOM element and a state to store the element's width.
 * It automatically updates the width on window 'load' and 'resize' events with debounced calls
 * to ensure performant resizing.
 * 
 * @returns {Object} An object containing:
 * - containerRef: A React ref object that should be attached to the component whose width you want to measure.
 * - containerWidth: The current width of the component or undefined if not yet measured.
 * - updateWidth: A function that can be called to manually update the component's width.
 */
export function useComponentWidth() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined)

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    updateWidth()
    window.addEventListener('load', updateWidth)
  }, [updateWidth])

  const debouncedUpdateWidth = useCallback(debounce(updateWidth, 250), [updateWidth])

  useEffect(() => {
    updateWidth()
    window.addEventListener('resize', debouncedUpdateWidth)

    return () => window.removeEventListener('resize', debouncedUpdateWidth)
  }, [debouncedUpdateWidth])

  return { containerRef, containerWidth, updateWidth }
}


