import React from 'react'
import styled from 'styled-components'

const StyledResouceQueryError = styled.div`
  padding: 32px;
`

export const ResouceQueryErrorMessage = ({ message }: { message?: string }) => (
  <StyledResouceQueryError>
    {message || 'Something stopped working. Try refreshing the page and giving it some time.'}
  </StyledResouceQueryError>
)
