import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Column } from 'react-table'
import { Tooltip } from 'react-tooltip'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import {
  DefaultColumnFilter, NumberRangeColumnFilter, SelectColumnFilter,
} from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { colors } from '../../styles/theme'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { IAsset } from './assets.types'

const isUnclosedAsset = (asset: IAsset): boolean =>
  asset.state === 'open' || asset.state === 'closing'

export const useAssetColumns = ({
  isAdmin = false,
  handleRowClick,
  colWidths,
  properties = [],
}: {
  isAdmin?: boolean
  handleRowClick: (id: string) => void
  colWidths: KeyVal
  properties?: string[]
}) => {
  const queryClient = useQueryClient()
  return [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: DefaultColumnFilter,
      width: colWidths?.name || 300,
      Cell: ({ cell, value }) => (
        <>
          <StyledNameCell
            data-tooltip-id={`assetNameTooltip${cell.row.original.uid}`}
            data-tooltip-content={`Asset is in ${cell.row.original.state} state. Please refresh the list momentarily to update its status.`}
            color={
              isUnclosedAsset(cell.row.original)
                ? colors.stateLabelGrey
                : colors.primaryBlue
            }
            onClick={
              () => handleRowClick(cell.row.original.uid.toString())
            }
          >
            <FileZipIcon height={14} />
            {value}
          </StyledNameCell>
          {isUnclosedAsset(cell.row.original) && (
            <Tooltip id={`assetNameTooltip${cell.row.original.uid}`} />
          )}
        </>
      ),
    },
    {
      Header: 'Location',
      accessor: 'location',
      Filter: DefaultColumnFilter,
      width: colWidths?.location || 250,
      Cell: props => (
        <StyledLinkCell to={`${props.row.original.links.space}/apps`}><ObjectGroupIcon />{props.value}</StyledLinkCell>
      ),
    },
    {
      Header: 'Featured',
      accessor: 'featured',
      Filter: SelectColumnFilter,
      options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false'}],
      width: colWidths?.featured || 93,
      Cell: props => (
        <div style={{ paddingLeft: 20 }}><FeaturedToggle disabled={!isAdmin} resource="assets" featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['assets']})} /></div>
      ),
    },
    {
      Header: 'Added By',
      accessor: 'added_by',
      Filter: DefaultColumnFilter,
      width: colWidths?.added_by || 200,
      Cell: props => (
        <a data-turbolinks="false" href={props.cell.row.original.links.user || '#'}>
          {props.value}
        </a>
      ),
    },
    {
      Header: 'Size',
      accessor: 'file_size',
      Filter: NumberRangeColumnFilter,
      width: colWidths?.size || 160,
      filterPlaceholderFrom: `Min(KB)`,
      filterPlaceholderTo: `Max(KB)`,
    },
    {
      Header: 'Created',
      accessor: 'created_at_date_time',
      sortDescFirst: true,
      width: colWidths?.created_at_date_time || 198,
      disableFilters: true,
    },
    {
      Header: 'Tags',
      accessor: 'tags',
      disableSortBy: true,
      Filter: DefaultColumnFilter,
      width: colWidths?.tags || 500,
      Cell: props => {
        return(
          <StyledTags>
            {props.value.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
      )},
    },
    ...properties.map(property => ({
      Header: property,
      accessor: row => row.properties[property],
      id: `props.${property}`,
      disableFilters: true,
      width: colWidths?.[property] || 200,
    })),
  ] as Column<IAsset>[]
}
