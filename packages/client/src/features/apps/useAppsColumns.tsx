import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { propertiesColumnDef, selectColumnDef } from '../../components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { StyledLinkCell, StyledNameCell, StyledRunByYouLink } from '../home/home.styles'
import { getBasePathFromScope } from '../home/utils'
import { IApp } from './apps.types'

export const Pill = styled.div`
  border-radius: 7px;
  background-color: var(--primary-500);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
`

export const useAppsColumns = ({
  isAdmin = false,
  properties = [],
}: {
  isAdmin?: boolean
  properties?: string[]
}): ColumnDef<IApp>[] => {
  const location = useLocation()
  const queryClient = useQueryClient()

  return [
    selectColumnDef<IApp>(),
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 300,
      cell: info => (
        <StyledNameCell
          as={Link}
          to={`${location.pathname}/${info.row.original.uid}`}
          state={{ from: location.pathname, fromSearch: location.search }}
        >
          <CubeIcon height={14} />
          {info.getValue<string>()}
        </StyledNameCell>
      ),
    },
    {
      header: 'Title',
      accessorKey: 'title',
      filterFn: 'includesString',
      size: 300,
      cell: c => c.getValue(),
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
      enableColumnFilter: false,
      size: 93,
      cell: props => (
        <div style={{ paddingLeft: 20 }}>
          <FeaturedToggle
            resource="apps"
            disabled={!isAdmin}
            featured={props.cell.row.original.featured}
            uids={[props.cell.row.original.uid]}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['apps']})}
          />
        </div>
      ),
    },
    {
      header: 'Revision',
      accessorKey: 'revision',
      enableSorting: false,
      enableColumnFilter: false,
      size: 198,
      cell: c => c.getValue(),
    },
    {
      header: 'Explorers',
      accessorKey: 'explorers',
      enableColumnFilter: false,
      size: 100,
      cell: c => c.getValue(),
    },
    {
      header: 'Org',
      accessorKey: 'org',
      enableColumnFilter: false,
      size: 180,
      cell: c => c.getValue(),
    },
    {
      header: 'Added By',
      accessorKey: 'added_by',
      filterFn: 'includesString',
      size: 200,
      cell: props => (
        <a data-turbolinks="false" href={props.cell.row.original.links.user}>
          {props.cell.row.original.added_by_fullname}
        </a>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
      filterFn: 'includesString',
      size: 250,
      cell: props => (
        <StyledLinkCell to={`${props.row.original.links.space}/apps`}>
          <ObjectGroupIcon />
          {props.getValue<string>()}
        </StyledLinkCell>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at_date_time',
      filterFn: 'includesString',
      sortDescFirst: true,
      enableColumnFilter: false,
      size: 198,
      cell: c => c.getValue(),
    },
    {
      header: 'Run By You',
      accessorKey: 'run_by_you',
      enableColumnFilter: false,
      size: 100,
      cell: props => (
        <StyledRunByYouLink
          data-turbolinks="false"
          href={`${getBasePathFromScope(props.row.original.scope)}/apps/${props.row.original.uid}/jobs/new`}
        >
          <Pill>{props.getValue<string>()}</Pill>
        </StyledRunByYouLink>
      ),
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      filterFn: 'includesString',
      enableSorting: false,
      size: 500,
      cell: props => {
        return (
          <StyledTags>
            {props.getValue<string[]>().map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )
      },
    },
    ...propertiesColumnDef<IApp>(properties),
  ]
}
