import { VisibilityState } from '@tanstack/react-table'
import { LocationKey } from '../utils'
import { useLocalStorage } from './useLocalStorage'

export interface IColumnPropsLocalStorage {
  columnVisibility: VisibilityState
  setColumnVisibility: (cols: VisibilityState) => void
}

export function useHiddenColumnLocalStorage(locationKey: LocationKey): IColumnPropsLocalStorage {
  const [visibleCols, setVisibleCols] = useLocalStorage<Record<LocationKey, VisibilityState>>('columns-visibility', {})
  const setVisibleColumns = (cols: VisibilityState) => {
    setVisibleCols({ ...visibleCols, [locationKey]: cols })
  }
  return ({
    columnVisibility: visibleCols[locationKey],
    setColumnVisibility: setVisibleColumns,
  })
}
