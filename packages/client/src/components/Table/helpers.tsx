import React from 'react'
import { useAsyncDebounce, TableInstance, Column } from 'react-table'
// import matchSorter from 'match-sorter' // fuzzy filtering lib
import { InputText } from '../InputText'

type IGlobalFilterProps<T extends object> = {
  instance: TableInstance<T>
}

// Define a default UI for filtering
export function GlobalFilter<T extends {}>({ instance }: IGlobalFilterProps<T>) {
  const count = instance.preGlobalFilteredRows.length
  const [value, setValue] = React.useState(instance.state.globalFilter)
  const onChange = useAsyncDebounce((value) => {
    instance.setGlobalFilter(value || undefined)
  }, 200)

  return (
    <div>
      <InputText
        value={value || ''}
        onChange={(e: any) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`Global Search: ${count} records...`}
      />
    </div>
  )
}

// Define a default UI for filtering
export function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}: any) {
  const count = preFilteredRows.length

  return (
    <InputText
      value={filterValue || ''}
      onChange={(e: any) => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

// export function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
//   return matchSorter(rows, filterValue, {
//     keys: [(row: any) => row.values[id]],
//   })
// }

// Let the table remove the filter if the string is empty
// fuzzyTextFilterFn.autoRemove = (val: any) => !val

// Define a custom filter filter function!
export function filterGreaterThan(rows: any, id: any, filterValue: any) {
  return rows.filter((row: any) => {
    const rowValue = row.values[id]
    return rowValue >= filterValue
  })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val: any) => typeof val !== 'number'



export enum CustomFilterComponentTypes {
  'SelectColumnFilter' = 'SelectColumnFilter',
  'SliderColumnFilter' = 'SliderColumnFilter',
}

export const CustomFilterComponent = {
  // [CustomFilterComponentTypes.SelectColumnFilter]: SelectColumnFilter,
  // [CustomFilterComponentTypes.SliderColumnFilter]: SliderColumnFilter,
}

export enum CustomFilterFunctionTypes {
  'filterGreaterThan' = 'filterGreaterThan',
}

export const CustomFilterFunction = {
  [CustomFilterFunctionTypes.filterGreaterThan]: filterGreaterThan,
}


// The columns from the config file will need to be modified so that the filter
// type will map to the correct filter Component. Same with the filterFunction.
export function prepareColumns(configCols: any) {
  let columns = configCols

  // Remap filterComponent -> Filter
  // columns = columns.map(
  //   (col: any) => {
  //     if (col.filterComponent) {
  //       return {
  //         ...col,
  //         Filter: CustomFilterComponent[
  //           col.filterComponent as CustomFilterComponentTypes
  //         ] as any,
  //       }
  //     }
  //     return col
  //   }
  // )

  // Remap filterFunction -> filter
  columns = columns.map((col: any) => {
    if (col.filterFunction) {
      return {
        ...col,
        filter: CustomFilterFunction[
          col.filterComponent as CustomFilterFunctionTypes
        ] as any,
      }
    }
    return col
  })

  return columns
}
