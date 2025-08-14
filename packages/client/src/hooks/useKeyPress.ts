// https://github.com/jacobbuck/react-use-keypress
import { useEffect, useRef } from 'react'

export const useKeyPress = (keys: string | string[], handler: (e: KeyboardEvent) => void) => {
  const eventListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null)

  useEffect(() => {
    eventListenerRef.current = (event: KeyboardEvent) => {
      shimKeyboardEvent(event)
      if (Array.isArray(keys) ? keys.includes(event.key) : keys === event.key) {
        handler?.(event)
      }
    }
  }, [keys, handler])

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) => {
      eventListenerRef.current?.(event)
    }
    window.addEventListener('keydown', eventListener)
    return () => {
      window.removeEventListener('keydown', eventListener)
    }
  }, [])
}


const aliases = new Map([
  ['Win', 'Meta'],
  ['Scroll', 'ScrollLock'],
  ['Spacebar', ' '],
  ['Down', 'ArrowDown'],
  ['Left', 'ArrowLeft'],
  ['Right', 'ArrowRight'],
  ['Up', 'ArrowUp'],
  ['Del', 'Delete'],
  ['Crsel', 'CrSel'],
  ['Exsel', 'ExSel'],
  ['Apps', 'ContextMenu'],
  ['Esc', 'Escape'],
  ['Decimal', '.'],
  ['Multiply', '*'],
  ['Add', '+'],
  ['Subtract', '-'],
  ['Divide', '/'],
])

const shimKeyboardEvent = (event: KeyboardEvent) => {
  if (aliases.has(event.key)) {
    const key = aliases.get(event.key)

    Object.defineProperty(event, 'key', {
      configurable: true,
      enumerable: true,
      get() {
        return key
      },
    })
  }
}
