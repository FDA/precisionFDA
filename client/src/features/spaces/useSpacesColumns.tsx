import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Column } from 'react-table'
import styled from 'styled-components'
import {
  DefaultColumnFilter,
  SelectColumnFilter,
} from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { colors, fontWeight } from '../../styles/theme'
import { ISpace } from './spaces.types'
import { SpaceTypeName } from './common'
import { UsersIcon } from '../../components/icons/UsersIcon'
import { PrivateIcon } from '../../components/icons/PrivateIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { GovernmentIcon } from '../../components/icons/GovernmentIcon'
import { AdminIcon } from '../../components/icons/AdminIcon'
import { ProfileIcon } from '../../components/icons/ProfileIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { BoltIcon } from '../../components/icons/BoltIcon'

export const SpaceTableNameCell = styled.div`
  display: flex;
  flex-direction: column;

  a {
    font-weight: ${fontWeight.bold};
    font-size: 16px;
    line-height: 18px;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: ${colors.textMediumGrey};
  }
`

export const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 5px;
`
export const StyledName = styled.span`
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 16px;
  cursor: not-allowed;
  color: ${colors.textDarkGreyInactive};
`
export const StyledNameLink = styled(Link)`
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 16px;
`

export const StatusCell = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ isActive }) => (isActive ? 'green' : 'red')};
  text-transform: capitalize;

  ${Dot} {
    color: ${({ isActive }) => (isActive ? 'green' : 'red')};
    margin-right: 8px;
  }
`

export const TypeDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 16px;
`

export const SpaceTableTypeCell = styled.div`
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 4px;

  ${TypeDot} {
    background-color: black;
    margin-right: 8px;
  }
`
export const SpaceTableCounterCell = styled.div`
  display: flex;
  gap: 16px;
`
export const SpaceTableCounterItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`
const findSpaceTypeIcon = (type: string) => {
  switch (type) {
    case 'groups':
      return <UsersIcon />
    case 'review':
      return <ProfileIcon />
    case 'private_type':
      return <PrivateIcon />
    case 'government':
      return <GovernmentIcon />
    case 'administrator':
      return <AdminIcon />
    default:
      return <UsersIcon />
  }
}

export const useSpacesColumns = ({
  colWidths,
  isAdmin = false,
}: {
  colWidths?: any
  isAdmin?: boolean
}) =>
  useMemo<Column<ISpace>[]>(
    () =>
      [
        {
          Header: 'Type',
          accessor: 'type',
          Filter: SelectColumnFilter,
          options: [
            { label: 'Groups', value: 'groups' },
            { label: 'Review', value: 'review' },
            { label: 'Private type', value: 'private_type' },
            { label: 'Government', value: 'government' },
            { label: 'Administrator', value: 'administrator' },
          ],
          width: colWidths?.type || 150,
          Cell: ({ row }) => (
            <SpaceTableTypeCell>
              {findSpaceTypeIcon(row.original.type)}
              {SpaceTypeName[row.original.type]}
            </SpaceTableTypeCell>
          ),
        },
        {
          Header: 'Name',
          accessor: 'name',
          width: colWidths?.name || 368,
          Filter: DefaultColumnFilter,
          Cell: ({ row }) => (
            <SpaceTableNameCell>
              {row.original.current_user_membership ? (
                <StyledNameLink to={{ pathname: `/spaces/${row.original.id}` }}>
                  {row.original.name}
                </StyledNameLink>
              ) : (
                <StyledName>{row.original.name}</StyledName>
              )}
              <p>{row.original.description}</p>
            </SpaceTableNameCell>
          ),
        },
        {
          Header: 'State',
          accessor: 'state',
          width: colWidths?.state || 150,
          disableFilters: true,
          Cell: ({ row }) => (
            <StatusCell isActive={row.original.state === 'active'}>
              <Dot />
              {row.original.state}
            </StatusCell>
          ),
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          disableSortBy: true,
          Filter: DefaultColumnFilter,
          width: colWidths?.tags || 200,
          Cell: ({ value }) => (
            <StyledTags>
              {value.map(tag => (
                <StyledTagItem key={tag}>{tag}</StyledTagItem>
              ))}
            </StyledTags>
          ),
        },
        {
          Header: 'Created on',
          accessor: 'created_at',
          disableFilters: true,
          width: colWidths?.created_at || 150,
        },
        {
          Header: 'Modified on',
          accessor: 'updated_at',
          disableFilters: true,
          width: colWidths?.updated_at || 150,
        },
        {
          Header: 'Reviewer/Host lead',
          accessor: 'host_lead',
          disableFilters: true,
          width: colWidths?.host_lead || 200,
          Cell: ({ row }) => <div>{row.original?.host_lead?.name}</div>,
        },
        {
          Header: 'Sponsor/Guest lead',
          accessor: 'guest_lead',
          disableFilters: true,
          width: colWidths?.guest_lead || 200,
          Cell: ({ row }) => <div>{row.original?.guest_lead?.name}</div>,
        },
        {
          Header: 'Counters',
          accessor: 'counters',
          disableFilters: true,
          width: colWidths?.counters || 300,
          Cell: ({ row }) => (
            <SpaceTableCounterCell>
              <SpaceTableCounterItem>
                <FileIcon /> {row.original?.counters.apps}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <CubeIcon height={14} /> {row.original?.counters.files}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <BoltIcon /> {row.original?.counters.jobs}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <CogsIcon height={14} />
                {row.original?.counters.workflows}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <UsersIcon /> {row.original?.counters.members}
              </SpaceTableCounterItem>
            </SpaceTableCounterCell>
          ),
        },
      ] as Column<ISpace>[],
    [],
  )
