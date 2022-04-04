import React, { FC, createContext } from 'react'

export interface SelectedContextData {
  selectedIds: string[],
  selectedItems: Record<string, boolean>;
  resetSelected: () => void;
  setSelectedItems: (items: any) => void;
}
 
export const selectedContextDefaultValue: SelectedContextData = {
  selectedIds: [],
  selectedItems: {},
  resetSelected: () => null,
  setSelectedItems: () => null
}
 
export const SelectedContext = createContext<SelectedContextData>(selectedContextDefaultValue);

export const SelectedProvider: FC = ({ children }) => {
  const postsContextValue = useSelectedContextValue()
  return (
    <SelectedContext.Provider value={postsContextValue} >
      {children}
    </SelectedContext.Provider>
  )
}

export function useSelectedContextValue(): SelectedContextData {
  const [selectedItems, setSelectedItems] = React.useState<Record<string, boolean>>({})
  const resetSelected = () => setSelectedItems({})
  const selectedIds = Object.keys(selectedItems).map(k => k)
  console.log(selectedIds);
  
  return {
    selectedIds,
    selectedItems,
    resetSelected,
    setSelectedItems,
  }
}
