import { RowSelectionState } from '@tanstack/react-table'
import { useState } from 'react'

export const useListSelect = () => {
  const [selectedIndexes, setSelectedIndexes] = useState<RowSelectionState>({})
  return {
    selectedIndexes,
    setSelectedIndexes,
  }
}
