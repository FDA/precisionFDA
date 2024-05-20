import React from 'react'
import styled from 'styled-components'

export const StyledIdenticon = styled.img`
  border: 1px solid #dededf;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background-color: #dededf;
`

export const Identicon = ({ dxuser }: {dxuser: string}) => {
  return <StyledIdenticon src={`https://www.gravatar.com/avatar/${dxuser}?s=32&d=identicon&r=PG`} />
}
