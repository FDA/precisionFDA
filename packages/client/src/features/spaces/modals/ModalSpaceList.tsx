import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { VerticalCenter } from '../../../components/Page/styles'
import { ISpaceV2 } from '../spaces.types'
import { findSpaceTypeIcon } from '../useSpacesColumns'

const SpaceStyledLink = styled(Link)<{ $isDisabled?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 4px 0;
  ${({ $isDisabled }) =>
    $isDisabled &&
    `
    pointer-events: none;
    cursor: not-allowed;
    color: var(--c-text-400);
  `}
`

export const ModalSpaceList = ({ spaces }: { spaces: ISpaceV2[] }) => {
  return (
    <>
      {spaces.map(s => (
        <SpaceStyledLink $isDisabled={!s.currentUserMembership} key={s.id} to={`/spaces/${s.id}`} target="_blank">
          <VerticalCenter>{findSpaceTypeIcon(s.type)}</VerticalCenter>
          {s.name}
        </SpaceStyledLink>
      ))}
    </>
  )
}
