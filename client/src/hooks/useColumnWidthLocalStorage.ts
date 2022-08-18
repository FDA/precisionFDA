import { UseResizeColumnsState } from 'react-table';
import { useLocalStorage } from './useLocalStorage';

export interface IColumnWidthLocalStorage {
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
  colWidths: any
}

export function useColumnWidthLocalStorage(resource: string): IColumnWidthLocalStorage {
  const [colWidths, setColWidths] = useLocalStorage<any>(`home-colWidths-${resource}`, {});
  const saveColumnResizeWidth = (columnResizing: UseResizeColumnsState<any>['columnResizing']) => {
    setColWidths({ ...colWidths, ...columnResizing.columnWidths })
  }
  return ({
    colWidths,
    saveColumnResizeWidth,
  })
}
