import { useCallback, useState } from 'react'
import { RowSelectionState } from '@tanstack/react-table'

export const useListSelect = () => {
  const [selectedIndexes, setSelectedIndexesInternal] = useState<RowSelectionState>({})

  const setSelectedIndexes = useCallback((value: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
    setSelectedIndexesInternal(value)
  }, [])

  return {
    selectedIndexes,
    setSelectedIndexes,
  }
}
