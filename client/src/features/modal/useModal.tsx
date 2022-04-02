import { useState } from 'react'

export interface UseModal {
  isShown: boolean
  toggle: () => void
  setShowModal: (val: boolean) => void
}

export const useModal = (def: boolean = false): UseModal => {
  const [isShown, setIsShown] = useState<boolean>(def)
  const toggle = () => setIsShown(!isShown)
  const setShowModal = (val: boolean) => setIsShown(val)

  return {
    isShown,
    toggle,
    setShowModal,
  }
}
