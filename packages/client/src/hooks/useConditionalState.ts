
import { SetStateAction, useCallback, useMemo, useState } from 'react'

export function useConditionalState<T>(isAllowed: boolean, onViolation: () => void, defaultValue?: T) {
  const [val, setVal] = useState(defaultValue)
  const value = useMemo(
    () => isAllowed ? val : defaultValue,
    [isAllowed, val],
  )
  const setValue = useCallback((cb: SetStateAction<T | undefined>) => {
    if (isAllowed) {
      setVal(cb)
    } else {
      onViolation()
    }
  }, [isAllowed, onViolation])
  return [value, setValue] as const
}
