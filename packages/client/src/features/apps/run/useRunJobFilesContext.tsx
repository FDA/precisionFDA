import React from 'react'

export interface RunJobFilesContextType {
  validatedFilesCache: Record<string, boolean>
  setValidatedFilesCache: (cache: Record<string, boolean>) => void
}

const RunJobFilesContext = React.createContext<RunJobFilesContextType>({
  validatedFilesCache: {},
  setValidatedFilesCache: () => {},
})

export const RunJobFilesProvider = RunJobFilesContext.Provider

export const useRunJobFilesContext = () => React.useContext(RunJobFilesContext)
