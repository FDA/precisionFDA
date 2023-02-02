import React, { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ReactTooltip from 'react-tooltip'
import { Column } from 'react-table'
import { FeaturedToggle } from '../../../components/FeaturedToggle'
import { FileZipIcon } from '../../../components/icons/FileZipIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import {
  DefaultColumnFilter, NumberRangeColumnFilter, SelectColumnFilter
} from '../../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { StyledLinkCell, StyledNameCell } from '../home.styles'
import { KeyVal } from '../types'
import { IAsset } from './assets.types'
import { colors } from '../../../styles/theme'

const isUnclosedAsset = (asset: IAsset): boolean =>
  asset.state === 'open' || asset.state === 'closing'

export const useAssetColumns = ({
  isAdmin = false,
  handleRowClick,
  colWidths
}: {
  isAdmin?: boolean
  handleRowClick: (id: string) => void
  colWidths: KeyVal
}) => {
  const queryClient = useQueryClient()
  return useMemo<Column<IAsset>[]>(
    () =>
      [
        {
          Header: 'Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 300,
          Cell: ({ cell, value }) => (
            <>
              <StyledNameCell
                data-tip
                data-for={`assetNameTooltip${cell.row.original.uid}`}
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
                <ReactTooltip
                  id={`assetNameTooltip${cell.row.original.uid}`}
                  place="top"
                  effect="solid"
                >
                  Asset is in {cell.row.original.state} state. Please refresh the list momentarily to update its status.
                </ReactTooltip>
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
            <div style={{ paddingLeft: 20 }}><FeaturedToggle disabled={!isAdmin} resource="assets" featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries(['assets'])} /></div>
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
          width: colWidths?.size || 198,
          filterPlaceholderFrom: `Min(Kb)`,
          filterPlaceholderTo: `Max(Kb)`,
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
          )}
        },
      ] as Column<IAsset>[],
    [],
  )
}
