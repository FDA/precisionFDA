import type { Column, ColumnDef } from '@tanstack/react-table'
import React, { useEffect } from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { SwitchButton } from '@/components/Button'
import { AdminIcon } from '@/components/icons/AdminIcon'
import { GovernmentIcon } from '@/components/icons/GovernmentIcon'
import { PrivateIcon } from '@/components/icons/PrivateIcon'
import { ProfileIcon } from '@/components/icons/ProfileIcon'
import { UsersIcon } from '@/components/icons/UsersIcon'
import { selectColumnDef } from '@/components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '@/components/Tags'
import { formatDateOnly } from '@/utils/formatting'
import SelectFilter, { selectFilterFn } from '../../components/Table/components/SelectFilter'
import { SpaceTypeName } from './common'
import { FdaRestrictedIcon } from './FdaRestrictedIcon'
import { ProtectedIcon } from './ProtectedIcon'
import type { ISpaceV2 } from './spaces.types'
import { useSpaceHiddenMutation } from './useSpaceHiddenMutation'

const SpaceHiddenToggle = ({ id, hidden }: { id: number; hidden: boolean }) => {
  const spaceHiddenMutation = useSpaceHiddenMutation()
  const [spaceHidden, setSpaceHidden] = React.useState(hidden)
  useEffect(() => {
    setSpaceHidden(hidden)
  }, [hidden])
  return (
    <SwitchButton
      data-active={spaceHidden}
      onClick={() => {
        spaceHiddenMutation.mutateAsync({ ids: [id], hidden: !spaceHidden })
        setSpaceHidden(!spaceHidden)
      }}
    />
  )
}

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
  size: 8px;
  height: 8px;
  border-radius: 5px;
`
export const StyledName = styled.span<{ $isAccess: boolean }>`
  font-weight: 600;
  font-size: 16px;

  ${({ $isAccess }) =>
    !$isAccess &&
    `
      color: var(--c-text-400);
      cursor: not-allowed;
    `}
`

export const StatusCell = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $isActive }) => ($isActive ? 'var(--success-400)' : 'var(--warning-500)')};
  text-transform: capitalize;
  font-weight: 600;

  ${Dot} {
    ${({ $isActive }) =>
      $isActive
        ? `
            color: var(--success-400);
            background-color: var(--success-400);
          `
        : `
            color: var(--warning-500);
            background-color: var(--warning-500);
          `};
    margin-right: 8px;
  }
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
  flex-shrink: 0;
`

export const findSpaceTypeIcon = (type: string | number) => {
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

export const useSpacesColumns = (): ColumnDef<ISpaceV2>[] => {
  return [
    selectColumnDef<ISpaceV2>(),
    {
      header: 'Type',
      accessorKey: 'type',
      enableSorting: false,
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<ISpaceV2>) => (
          <SelectFilter
            column={column}
            options={[
              { label: 'Group', option: 'groups' },
              { label: 'Review', option: 'review' },
              { label: 'Private', option: 'private_type' },
              { label: 'Government', option: 'government' },
              { label: 'Administrator', option: 'administrator' },
            ]}
          />
        ),
      },
      size: 150,
      cell: ({ row }) => (
        <SpaceTableTypeCell>
          {findSpaceTypeIcon(row.original.type)}
          {SpaceTypeName[row.original.type]}
        </SpaceTableTypeCell>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'name',
      size: 368,
      filterFn: 'includesString',
      cell: ({ row }) => (
        <SpaceTableNameCell>
          <NameRow>
            {row.original.protected && (
              <ProtectedIcon color={row.original.currentUserMembership ? undefined : 'var(--c-text-400)'} />
            )}
            {row.original.restrictedReviewer && (
              <FdaRestrictedIcon color={row.original.currentUserMembership ? undefined : 'var(--c-text-400)'} />
            )}
            {row.original.currentUserMembership ? (
              <StyledName $isAccess as={Link} to={{ pathname: `/spaces/${row.original.id}` }}>
                {row.original.name}
              </StyledName>
            ) : (
              <StyledName $isAccess={false}>{row.original.name}</StyledName>
            )}
          </NameRow>
          <p>{row.original.description}</p>
        </SpaceTableNameCell>
      ),
    },
    {
      header: 'ID',
      accessorKey: 'id',
      enableSorting: false,
      size: 100,
    },
    {
      header: 'State',
      accessorKey: 'state',
      size: 150,
      enableSorting: false,
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<ISpaceV2>) => (
          <SelectFilter
            column={column}
            options={[
              { label: 'Active', option: 'active' },
              { label: 'Locked', option: 'locked' },
              { label: 'Unactivated', option: 'unactivated' },
            ]}
          />
        ),
      },
      cell: ({ row }) => (
        <StatusCell $isActive={row.original.state === 'active'}>
          <Dot />
          {row.original.state}
        </StatusCell>
      ),
    },
    {
      header: 'Hidden',
      accessorKey: 'hidden',
      size: 100,
      enableSorting: false,
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<ISpaceV2>) => (
          <SelectFilter
            column={column}
            options={[
              { label: 'Not hidden', option: 'false' },
              { label: 'Hidden', option: 'true' },
            ]}
          />
        ),
      },
      cell: c => (
        <div>
          <SpaceHiddenToggle id={c.row.original.id} hidden={c.row.original.hidden} />
        </div>
      ),
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      enableSorting: false,
      filterFn: 'includesString',
      size: 200,
      cell: ({ row }) => (
        <StyledTags>
          {row.original.tags.map(tag => (
            <StyledTagItem key={tag}>{tag}</StyledTagItem>
          ))}
        </StyledTags>
      ),
    },
    {
      header: 'Created on',
      accessorKey: 'createdAt',
      sortDescFirst: true,
      enableColumnFilter: false,
      size: 150,
      cell: ({ row }) => <div>{formatDateOnly(row.original?.createdAt)}</div>,
    },
    {
      header: 'Modified on',
      accessorKey: 'updatedAt',
      sortDescFirst: true,
      enableColumnFilter: false,
      size: 150,
      cell: ({ row }) => <div>{formatDateOnly(row.original?.updatedAt)}</div>,
    },
    {
      header: 'Reviewer/Host lead',
      accessorKey: 'hostLead',
      enableSorting: false,
      enableColumnFilter: false,
      size: 200,
    },
    {
      header: 'Sponsor/Guest lead',
      accessorKey: 'guestLead',
      enableSorting: false,
      enableColumnFilter: false,
      size: 200,
    },
  ]
}
