import { LocationKey } from '../utils'
import { useLocalStorage } from './useLocalStorage'

export interface IColumnPropsLocalStorage {
  saveHiddenColumns: (cols: string[]) => void
  hiddenColumns: string[]
}

export function useHiddenColumnLocalStorage(locationKey: LocationKey): IColumnPropsLocalStorage {
  const [hiddenColumns, setHiddenCols] = useLocalStorage<Record<LocationKey, string[]>>('columns-hidden', {})
  const saveHiddenColumns = (cols: string[]) => {
    setHiddenCols({ ...hiddenColumns, [locationKey]: cols })
  }
  return ({
    hiddenColumns: hiddenColumns[locationKey],
    saveHiddenColumns,
  })
}
