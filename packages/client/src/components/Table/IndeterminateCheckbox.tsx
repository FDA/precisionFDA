import React, { useRef, useEffect } from 'react'
export const CHECKED = 1
export const UNCHECKED = 2
export const INDETERMINATE = -1 

interface IndeterminateCheckboxProps {
  indeterminate?: boolean;
  name: string;
}

export const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }: any, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      //@ts-ignore
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)
