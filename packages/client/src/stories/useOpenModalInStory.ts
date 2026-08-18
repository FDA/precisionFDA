import { useEffect } from 'react'

export const useOpenModalInStory = (setShowModal: (isShown: boolean) => void) => {
  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])
}
