import React from 'react'
import styled, { css } from 'styled-components'
import { Dropdown } from '.'
import { CaretIcon } from '../icons/CaretIcon'
import { HistoryIcon } from '../icons/HistoryIcon'
import { colors } from '../../styles/theme'
import { Revision } from '../../features/home/workflows/workflows.types'
import { Link } from 'react-router-dom'

const StyledRevisionDropdownButton = styled.button`
  height: 34px;
  background: white;
  border: 1px solid #daeffb;
  border-radius: 3px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  color: ${colors.textMediumGrey};
  font-size: 14px;
  font-weight: 700;
  display: flex;
  gap: 6px;
  &:hover {
    background-color: #F4F8FD;
    border-color: #63A5DE;
  }
`
const RevisionNum = styled.span`
  color: ${colors.textBlack};
`
const TagPill = styled.div`
  color: #ffffff;
  background-color: #1F70B5;
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
const Li = styled.li<{active: boolean}>`
  white-space: nowrap;
  ${({ active }) => active && css`background-color: ${colors.subtleBlue};`}
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
    (acc, shot) => (acc > shot.revision ? acc : shot.revision),
    0,
  )

  const renderRevisionsList = () => (
    <Ol>
      <LiTitle>Revisions</LiTitle>
      {revisions.map(r => (
        <Li key={r.id} active={r.revision === selectedValue}><StyledLink to={linkToRevision(r)}>{r.revision}{r.revision === lastRevision && <TagPill>Latest</TagPill>}</StyledLink></Li>
      ))}
    </Ol>
  )

  return (
    <>
      <Dropdown
        placement="bottom-start"
        trigger="click"
        content={<>{renderRevisionsList()}</>}
      >
        {dropdownProps => (
          <StyledRevisionDropdownButton
            {...dropdownProps}
            active={dropdownProps.isActive}
            data-testid="workflow-show-dropdown-revision-button"
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
    </>
  )
}
