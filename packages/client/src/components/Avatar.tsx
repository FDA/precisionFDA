import React from 'react'
import styled from 'styled-components'

import { theme } from '../styles/theme'


export const StyledAvatar = styled.img`
  border-radius: 50%;
  background-color: ${theme.colors.mediumDarkBlue};
  width: 28px;
  height: 28px;
`

interface IAvatar {
  imgUrl?: string,
}

export const Avatar: React.FC<IAvatar> = ({ imgUrl, ...rest }) => {
  return (
  <StyledAvatar src={imgUrl} {...rest}></StyledAvatar>
)}
