import React from 'react'
import styled from 'styled-components'
import { InfoCircleIcon } from '../icons/InfoCircleIcon'
import { Svg } from '../icons/Svg'

const StyledFieldInfo = styled.div`
  display: flex;
  gap: 8px;
  color: #7d7d7d;
  ${Svg} {
    margin-top: 5px;
    align-self: flex-start;
    flex: 0 0 auto;
  }
`

export const FieldInfo = ({ text }: { text?: string }) => text ? (
  <StyledFieldInfo><InfoCircleIcon width={12} height={12} />{text}</StyledFieldInfo>
) : null