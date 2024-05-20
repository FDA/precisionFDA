import { UseResizeColumnsState } from 'react-table'
import { useLocalStorage } from './useLocalStorage'
import { LocationKey } from '../utils'

export interface IColumnWidthLocalStorage {
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
  colWidths: Record<string, number>
}

export function useColumnWidthLocalStorage(locationKey: LocationKey): IColumnWidthLocalStorage {
  const [colWidths, setColWidths] = useLocalStorage<Record<LocationKey, Record<string, number>>>('columns-width', {})
  const saveColumnResizeWidth = (columnResizing: UseResizeColumnsState<any>['columnResizing']) => {
    setColWidths({ ...colWidths, ...columnResizing.columnWidths })
    setColWidths({ ...colWidths, [locationKey]: { ...colWidths[locationKey], ...columnResizing.columnWidths }})
  }
  return ({
    colWidths: colWidths[locationKey],
    saveColumnResizeWidth,
  })
}
