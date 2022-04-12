import React, { useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { Column } from 'react-table'
import { FeaturedToggle } from '../../../components/FeaturedToggle'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import {
  DefaultColumnFilter,
  SelectColumnFilter
} from '../../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { StyledLinkCell } from '../home.styles'
import { KeyVal } from '../types'
import { IApp } from './apps.types'

export const useAppsColumns = ({
  colWidths,
  isAdmin = false,
}: {
  colWidths: KeyVal
  isAdmin?: boolean
}) => {
  const queryClient = useQueryClient()
  return  useMemo<Column<IApp>[]>(
    () =>
      [
        {
          Header: 'Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 198,
        },
        {
          Header: 'Title',
          accessor: 'title',
          Filter: DefaultColumnFilter,
          width: colWidths?.title || 300,
          Cell: props => (
            <StyledLinkCell to={`/home/apps/${props.row.original.uid}`}>
              <CubeIcon height={14} />
              {props.value}
            </StyledLinkCell>
          ),
        },
        {
          Header: 'Featured',
          accessor: 'featured',
          disableSortBy: true,
          Filter: SelectColumnFilter,
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          width: colWidths?.featured || 93,
          Cell: props => (
            <div style={{ paddingLeft: 20 }}>
              <FeaturedToggle resource="apps" disabled={!isAdmin} featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries(['apps'])} />
            </div>
          ),
        },
        {
          Header: 'Revision',
          accessor: 'revision',
          Filter: DefaultColumnFilter,
          width: colWidths?.revision || 198,
        },
        {
          Header: 'Added By',
          accessor: 'added_by',
          Filter: DefaultColumnFilter,
          width: colWidths?.added_by || 200,
          Cell: props => (
            <a href={props.cell.row.original.links.user}>{props.cell.row.original.added_by_fullname}</a>
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
          Header: 'Created',
          accessor: 'created_at_date_time',
          disableFilters: true,
          width: colWidths?.created_at_date_time || 198,
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          width: colWidths?.tags || 500,
          Cell: props => {
            return (
              <StyledTags>
                {props.value.map(tag => (
                  <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
              </StyledTags>
            )
          },
        },
      ] as Column<IApp>[],
    [],
  )
}

