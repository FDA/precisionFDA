import { useState } from 'react'
import { useConditionalState } from '../../hooks/useConditionalState'

export interface UseModal {
  isShown: boolean
  toggle: () => void
  setShowModal: (val: boolean) => void
}

export const useModal = (def = false): UseModal => {
  const [isShown, setIsShown] = useState<boolean>(def)
  const toggle = () => setIsShown((prevIsShown) => !prevIsShown)
  const setShowModal = (val: boolean) => setIsShown(val)

  return {
    isShown,
    toggle,
    setShowModal,
  }
}

export const useConditionalModal = (isAllowed: boolean, onViolation: () => void, defaultValue = false) => {
  const [isShown, setIsShown] = useConditionalState<boolean>(isAllowed, onViolation, defaultValue)
  const toggle = () => setIsShown((prevIsShown) => !prevIsShown)
  const setShowModal = (val: boolean) => setIsShown(val)

  return {
    isShown,
    toggle,
    setShowModal,
  }
}
