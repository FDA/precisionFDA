import { useEffect } from "react"
import { useWindowFocus } from "../../hooks/useWindowFocus"
import { UseModal } from "../modal/useModal"

export const SessionExpiration = ({ authModal }: { authModal: UseModal }) => {
  const windowFocus = useWindowFocus()

  useEffect(() => {
    if (windowFocus) {
        let sessionExpiredAt = document.cookie.split('; ').find(row => row.startsWith('sessionExpiredAt='))?.split('=')[1]
        if (sessionExpiredAt) {
          const exp = parseInt(sessionExpiredAt + '000')
          const current = new Date().valueOf()
          if(exp && (current > exp)) {
            authModal.setShowModal(true)
          } else {
            authModal.setShowModal(false)
          }
        }
    }
  }, [windowFocus])

  return null
}
