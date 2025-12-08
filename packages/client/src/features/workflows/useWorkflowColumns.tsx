import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link, useLocation } from 'react-router'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { propertiesColumnDef, selectColumnDef } from '../../components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { IWorkflow } from './workflows.types'
import { NetworkIcon } from '../../components/icons/NetworkIcon'

export const useWorkflowColumns = ({
  isAdmin = false,
  properties = [],
}: {
  isAdmin?: boolean
  properties?: string[]
}): ColumnDef<IWorkflow>[] => {
  const location = useLocation()
  const queryClient = useQueryClient()

  return [
    selectColumnDef<IWorkflow>(),
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 198,
      cell: props => (
        <StyledNameCell
          as={Link}
          to={`${location.pathname}/${props.cell.row.original.uid}`}
          state={{ from: location.pathname, fromSearch: location.search }}
        >
          <NetworkIcon height={18} />
          {props.row.original.name}
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
      header: 'Location',
      accessorKey: 'location',
      filterFn: 'includesString',
      size: 250,
      cell: props => (
        <StyledLinkCell to={`${props.row.original.links.space}/workflows`}>
          <ObjectGroupIcon />
          {props.row.original.location}
        </StyledLinkCell>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
      enableSorting: false,
      enableColumnFilter: false,
      // options: [
      //   { label: 'Yes', value: 'true' },
      //   { label: 'No', value: 'false' },
      // ],
      size: 93,
      cell: props => (
        <div style={{ paddingLeft: 20 }}>
          <FeaturedToggle
            disabled={!isAdmin}
            resource="workflows"
            featured={props.cell.row.original.featured}
            uids={[props.cell.row.original.uid]}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workflows']})}
          />
        </div>
      ),
    },
    {
      header: 'Added By',
      accessorKey: 'added_by',
      filterFn: 'includesString',
      size: 200,
      cell: props => (
        <a data-turbolinks="false" href={props.cell.row.original.links.user}>
          {props.cell.row.original.added_by}
        </a>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at_date_time',
      sortDescFirst: true,
      size: 198,
      enableColumnFilter: false,
      cell: c => c.getValue(),
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
            {props.cell.row.original.tags.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )
      },
    },
    ...propertiesColumnDef<IWorkflow>(properties),
  ]
}
