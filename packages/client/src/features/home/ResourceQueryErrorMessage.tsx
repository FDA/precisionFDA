import type React from 'react'
import styled from 'styled-components'

const StyledResouceQueryError = styled.div`
  padding: 32px;
`

export const ResourceQueryErrorMessage = ({ message }: { message?: string }): React.JSX.Element => (
  <StyledResouceQueryError>
    {message || 'Something stopped working. Try refreshing the page and giving it some time.'}
  </StyledResouceQueryError>
)
