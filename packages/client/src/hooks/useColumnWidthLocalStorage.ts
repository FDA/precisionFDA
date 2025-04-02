import { ColumnSizingState } from '@tanstack/react-table'
import { debounce } from 'lodash'
import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'


export interface IColumnWidthLocalStorage {
  saveColumnResizeWidth: (columnResizing: ColumnSizingState) => void
  colWidths: ColumnSizingState
}

export function useColumnWidthLocalStorage(locationKey: string): IColumnWidthLocalStorage {
  const [colWidths, setColWidths] = useLocalStorage<Record<string, ColumnSizingState>>(
    "columns-width",
    {}
  )

  const debouncedSave = useMemo(() => {
    return debounce((updatedColWidths: Record<string, ColumnSizingState>) => {
      setColWidths(updatedColWidths)
    }, 300)
  }, [setColWidths])

  return {
    colWidths: colWidths[locationKey] || {},
    saveColumnResizeWidth: (resizingColumnValue: ColumnSizingState) => {
      const updatedColWidths = {
        ...colWidths,
        [locationKey]: { ...colWidths[locationKey], ...resizingColumnValue },
      }

      debouncedSave(updatedColWidths)
    },
  }
}
