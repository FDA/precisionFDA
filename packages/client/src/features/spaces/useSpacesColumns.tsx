import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Column } from 'react-table'
import styled, { css } from 'styled-components'
import { DefaultColumnFilter, IdColumnFilter, SelectColumnFilter } from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { AdminIcon } from '../../components/icons/AdminIcon'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { DiscussionIcon } from '../../components/icons/DiscussionIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { GovernmentIcon } from '../../components/icons/GovernmentIcon'
import { PrivateIcon } from '../../components/icons/PrivateIcon'
import { ProfileIcon } from '../../components/icons/ProfileIcon'
import { UsersIcon } from '../../components/icons/UsersIcon'
import { FdaRestrictedIcon } from './FdaRestrictedIcon'
import { ProtectedIcon } from './ProtectedIcon'
import { SpaceTypeName } from './common'
import { ISpace } from './spaces.types'

export const SpaceTableNameCell = styled.div`
  display: flex;
  flex-direction: column;

  a {
    font-weight: bold;
    font-size: 16px;
    line-height: 18px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: var(--c-text-500);
  }
`

export const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 5px;
`
export const StyledName = styled.span<{ $isAccess: boolean }>`
  font-weight: 600;
  font-size: 16px;

  ${({ $isAccess }) =>
    !$isAccess &&
    css`
      color: var(--c-text-400);
      cursor: not-allowed;
    `}
`

export const StatusCell = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $isActive }) => ($isActive ? 'var(--success-600)' : 'var(--warning-500)')};
  text-transform: capitalize;
  font-weight: 600;

  ${Dot} {
    color: ${({ $isActive }) => ($isActive ? 'var(--success-600)' : 'var(--warning-500)')};
    margin-right: 8px;
  }
`

export const TypeDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 16px;
`

export const NameRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
`

export const SpaceTableTypeCell = styled.div`
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 10px;
`
export const SpaceTableCounterCell = styled.div`
  display: flex;
  gap: 14px;
`
export const SpaceTableCounterItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
`
export const findSpaceTypeIcon = (type: string) => {
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

export const useSpacesColumns = ({ colWidths, isAdmin = false }: { colWidths?: any; isAdmin?: boolean }) =>
  useMemo<Column<ISpace>[]>(
    () =>
      [
        {
          Header: 'Type',
          accessor: 'type',
          disableSortBy: true,
          Filter: SelectColumnFilter,
          title: 'Select space type',
          options: [
            { label: 'Groups', value: 'groups' },
            { label: 'Review', value: 'review' },
            { label: 'Private', value: 'private_type' },
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
          Cell: ({ row: { original } }) => (
            <SpaceTableNameCell>
              <NameRow>
                {original.protected && (
                  <ProtectedIcon color={original.current_user_membership ? undefined : 'var(--c-text-400)'} />
                )}
                {original.restricted_reviewer && (
                  <FdaRestrictedIcon color={original.current_user_membership ? undefined : 'var(--c-text-400)'} />
                )}
                {original.current_user_membership ? (
                  <StyledName $isAccess as={Link} to={{ pathname: `/spaces/${original.id}` }}>
                    {original.name}
                  </StyledName>
                ) : (
                  <StyledName $isAccess={false}>{original.name}</StyledName>
                )}
              </NameRow>
              <p>{original.description}</p>
            </SpaceTableNameCell>
          ),
        },
        {
          Header: 'ID',
          accessor: 'id',
          disableSortBy: true,
          Filter: IdColumnFilter,
          width: colWidths?.id || 100,
        },
        {
          Header: 'State',
          accessor: 'state',
          width: colWidths?.state || 150,
          disableSortBy: true,
          Filter: SelectColumnFilter,
          title: 'Select state',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Locked', value: 'locked' },
            { label: 'Unactivated', value: 'unactivated' },
          ],
          Cell: ({ row }) => (
            <StatusCell $isActive={row.original.state === 'active'}>
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
          sortDescFirst: true,
          disableFilters: true,
          width: colWidths?.created_at || 150,
        },
        {
          Header: 'Modified on',
          accessor: 'updated_at',
          sortDescFirst: true,
          disableFilters: true,
          width: colWidths?.updated_at || 150,
        },
        {
          Header: 'Reviewer/Host lead',
          accessor: 'host_lead',
          disableSortBy: true,
          disableFilters: true,
          width: colWidths?.host_lead || 200,
          Cell: ({ row }) => <div>{row.original?.host_lead?.name}</div>,
        },
        {
          Header: 'Sponsor/Guest lead',
          accessor: 'guest_lead',
          disableSortBy: true,
          disableFilters: true,
          width: colWidths?.guest_lead || 200,
          Cell: ({ row }) => <div>{row.original?.guest_lead?.name}</div>,
        },
        {
          Header: 'Counters',
          accessor: 'counters',
          disableSortBy: true,
          disableFilters: true,
          width: colWidths?.counters || 300,
          Cell: ({ row }) => (
            <SpaceTableCounterCell>
              <SpaceTableCounterItem>
                <FileIcon /> {row.original?.counters.files}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <CubeIcon height={14} /> {row.original?.counters.apps}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <BoltIcon /> {row.original?.counters.workflows}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <CogsIcon height={14} />
                {row.original?.counters.jobs}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <UsersIcon /> {row.original?.counters.members}
              </SpaceTableCounterItem>
              <SpaceTableCounterItem>
                <DiscussionIcon /> {row.original?.counters.discussions}
              </SpaceTableCounterItem>
            </SpaceTableCounterCell>
          ),
        },
      ] as Column<ISpace>[],
    [],
  )
