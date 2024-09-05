import React, { ReactNode, useContext } from 'react'
import { useLocalStorage } from '../../../hooks/useLocalStorage'

export type AlertDismissedContextType = {
  isAlertDismissed: boolean;
  setIsAlertDismissed: (isDismissed: boolean) => void;
}

const AlertDismissedContext = React.createContext<AlertDismissedContextType | undefined>(undefined)

export function AlertDismissedProvider({ children }: { children: ReactNode }) {
  const [isAlertDismissed, setIsAlertDismissed] = useLocalStorage<boolean>('isAlertDismissed', false, 'sessionStorage')

  return (
    <AlertDismissedContext.Provider value={{ isAlertDismissed, setIsAlertDismissed }}>
      {children}
    </AlertDismissedContext.Provider>
  )
}

export const useAlertDismissed = () => {
  const context = useContext(AlertDismissedContext)
  if (context === undefined) {
    throw new Error('useAlertDismissed must be used within an AlertDismissedProvider')
  }
  return context
}
