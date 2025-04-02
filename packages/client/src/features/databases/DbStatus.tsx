import React from 'react'
import styled from 'styled-components'
import { IDatabase } from './databases.types'
import { Running } from '../../components/icons/StateIcons'

const StatusText = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: capitalize;
  
  svg {
    height: 14px;
    width: 14px;
  }
`

export const DBStatus = ({ status }: { status: IDatabase['status'] }) => {
  return (
    <StatusText>
      {['creating', 'starting', 'stopping', 'terminating'].includes(status) && <Running />}
      {status}
    </StatusText>
  )
}
