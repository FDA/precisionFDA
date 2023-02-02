import React from 'react'

export const Checkbox = React.forwardRef((props: any, ref) => (
  <input ref={ref} type="checkbox" {...props} />
))

Checkbox.displayName = 'Checkbox'
