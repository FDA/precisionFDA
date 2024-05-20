import React from 'react'
import styled from 'styled-components'
import { theme } from '../../styles/theme'

const StyledInputDate = styled.input`
  line-height: 1.5715;
  padding: 4px 10px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  font-family: ${theme.fontFamily};
`

export const InputDate = React.forwardRef((props: any, ref) => (
  <StyledInputDate ref={ref} type="date" {...props} />
))

InputDate.displayName = 'InputDate'
