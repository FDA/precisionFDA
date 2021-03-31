import React from 'react'
import styled from 'styled-components'
import { theme } from '../styles/theme'

const StyledAvatar = styled.div`
  border-radius: 50%;
  background-color: ${theme.primaryLite};
  width: 40px;
  height: 40px;
`

export const Avatar = () => (
  <StyledAvatar></StyledAvatar>
)
