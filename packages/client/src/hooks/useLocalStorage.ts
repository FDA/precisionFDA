import { useState } from 'react'

/**
 * Custom hook for persisting state to `localStorage` or `sessionStorage`.
 *
 * This hook initializes the state with the value from `localStorage` if available,
 * otherwise it will use the provided `initialValue`. The state will be automatically
 * synchronized with `localStorage` or `sessionStorage` when it changes.
 * 
 * @param key - A unique key string for `storageType` to associate with this piece of state.
 * @param initialValue - The initial value to use if there is nothing in `localStorage` under the provided key.
 * @param storageType - either localStorage or sessionStorage. Defaults to localStorage.
 * @returns A stateful value, and a function to update it. The stateful value is
 *          persisted to `storageType` under the provided key.
 *
 * Usage:
 * const [value, setValue] = useSessionStorage('myKey', initialValue);
 */

export function useLocalStorage<T>(key: string, initialValue: T, storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window[storageType].getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window[storageType].setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue as T, setValue]
}
