import { UseResizeColumnsState } from 'react-table';
import { StringParam, useQueryParams } from 'use-query-params'
import { useLocalStorage } from '../../hooks/useLocalStorage';


export function useColumnWidthLocalStorage(resource: string) {
  const [colWidths, setColWidths] = useLocalStorage<any>(`home-colWidths-${resource}`, {});
  const saveColumnResizeWidth = (columnResizing: UseResizeColumnsState<any>['columnResizing']) => {
    setColWidths({ ...colWidths, ...columnResizing.columnWidths })
  }
  return ({
    colWidths,
    saveColumnResizeWidth,
  })
}
