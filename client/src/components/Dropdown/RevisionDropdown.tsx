import React from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { Dropdown } from '.'
import { CaretIcon } from '../icons/CaretIcon'
import { HistoryIcon } from '../icons/HistoryIcon'
import { colors } from '../../styles/theme'
import { Revision } from '../../features/workflows/workflows.types'
import { compactScrollBar } from '../Page/styles'

const StyledRevisionDropdownButton = styled.button`
  width: fit-content;
  height: 34px;
  background: transparent;
  border: 1px solid var(--c-layout-border);
  border-radius: 3px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  color: var(--c-text-700);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  gap: 6px;
  &:hover {
    border-color: var(--primary-600);
  }
`
const RevisionNum = styled.span`
  color: var(--c-text-700);
`
const TagPill = styled.div`
  color: #ffffff;
  background-color: var(--primary-500);
  font-weight: 400;
  font-size: 12px;
  border-radius: 3px;
  padding: 2px 6px;
`
const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.darkRed};
`

const LiTitle = styled.li`
  white-space: nowrap;
  padding: 3px 20px;
  color: ${colors.textMediumGrey};
`
const Li = styled.li<{$active: boolean}>`
  white-space: nowrap;
  ${({ $active }) => $active && css`background-color: ${colors.subtleBlue};`}
  &:hover {background-color: ${colors.white110};}
  a {
    color: ${colors.textBlack};
  }
`
export const StyledLink = styled(Link)`
  display: flex;
  justify-content: space-between;
  padding: 3px 20px;
`

const Ol = styled.ol`
  ${compactScrollBar}
  overflow-y: scroll;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  width: 100%;
  min-width: 180px;
  max-height: 350px;
  background-color: #fff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 3px;
  box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
  background-clip: padding-box;
`

export const RevisionDropdown = ({
  revisions,
  selectedValue,
  linkToRevision,
}: {
  revisions: Revision[]
  selectedValue: number
  linkToRevision: (revision: Revision) => string
}) => {
  const lastRevision = revisions.reduce(
    (acc, shot) => (acc > shot.revision || shot.deleted ? acc : shot.revision),
    0,
  )
  const renderRevisionsList = () => (
    <Ol>
      <LiTitle>Revisions</LiTitle>
      {revisions.map(r => (
        !r.deleted && <Li key={r.id} $active={r.revision === selectedValue}><StyledLink to={linkToRevision(r)}>{r.revision}{r.revision === lastRevision && <TagPill>Latest</TagPill>}</StyledLink></Li>
      ))}
    </Ol>
  )

  return (
    <Dropdown
      placement="bottom-start"
      trigger="click"
      content={<>{renderRevisionsList()}</>}
    >
      {dropdownProps => (
        <StyledRevisionDropdownButton
          {...dropdownProps}
          data-testid="dropdown-revision-button"
        >
          <DropdownIcon>
            <HistoryIcon height={13} />
          </DropdownIcon>
          Revision: <RevisionNum>{selectedValue}</RevisionNum>
          {lastRevision === selectedValue && <TagPill>Latest</TagPill>}
          <CaretIcon height={5} />
        </StyledRevisionDropdownButton>
      )}
    </Dropdown>
  )
}
