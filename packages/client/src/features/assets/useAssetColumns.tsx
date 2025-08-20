import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Tooltip } from 'react-tooltip'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { propertiesColumnDef } from '../../components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { IAsset } from './assets.types'
import NumberRangeFilter, { numberRangeFilterFn } from '../../components/Table/components/NumberRangeFilter'

const isUnclosedAsset = (asset: IAsset): boolean => asset.state === 'open' || asset.state === 'closing'

export const useAssetColumns = ({
  isAdmin = false,
  handleRowClick,
  properties = [],
}: {
  isAdmin?: boolean
  handleRowClick: (id: string) => void
  properties?: string[]
}): ColumnDef<IAsset>[] => {
  const queryClient = useQueryClient()
  return [
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 300,
      cell: c => (
        <>
          <StyledNameCell
            data-tooltip-id={`assetNameTooltip${c.row.original.uid}`}
            data-tooltip-content={`Asset is in ${c.row.original.state} state. Please refresh the list momentarily to update its status.`}
            color={isUnclosedAsset(c.row.original) ? 'var(--tertiary-600)' : 'var(--c-link)'}
            onClick={() => handleRowClick(c.row.original.uid.toString())}
          >
            <FileZipIcon height={14} />
            {c.row.original.name}
          </StyledNameCell>
          {isUnclosedAsset(c.row.original) && <Tooltip id={`assetNameTooltip${c.row.original.uid}`} style={{ zIndex: 3 }} />}
        </>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
      filterFn: 'includesString',
      size: 250,
      cell: c => (
        <StyledLinkCell to={`${c.row.original.links.space}/apps`}>
          <ObjectGroupIcon />
          {c.row.original.location}
        </StyledLinkCell>
      ),
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
      enableColumnFilter: false,
      size: 93,
      cell: props => (
        <div style={{ paddingLeft: 20 }}>
          <FeaturedToggle
            disabled={!isAdmin}
            resource="assets"
            featured={props.cell.row.original.featured}
            uids={[props.cell.row.original.uid]}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['assets']})}
          />
        </div>
      ),
    },
    {
      header: 'Added By',
      accessorKey: 'added_by',
      filterFn: 'includesString',
      size: 200,
      cell: c => (
        <a data-turbolinks="false" href={c.cell.row.original.links.user || '#'}>
          {c.row.original.added_by}
        </a>
      ),
    },
    {
      header: 'Size',
      accessorKey: 'file_size',
      size: 170,
      filterFn: numberRangeFilterFn,
      meta: {
        filterElement: column => (
          <NumberRangeFilter column={column} fromPlaceholder="Min(KB)" toPlaceholder="Max(KB)" />
        ),
      },
    },
    {
      header: 'Created',
      accessorKey: 'created_at_date_time',
      sortDescFirst: true,
      size: 198,
      enableColumnFilter: false,
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      enableSorting: false,
      filterFn: 'includesString',
      size: 500,
      cell: c => {
        return (
          <StyledTags>
            {c.row.original.tags.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )
      },
    },
    ...propertiesColumnDef<IAsset>(properties),
  ]
}
