import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Column } from 'react-table'
import styled from 'styled-components'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import {
  DefaultColumnFilter,
  SelectColumnFilter,
} from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { colors } from '../../styles/theme'
import { StyledLinkCell, StyledNameCell, StyledRunByYouLink } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { getBasePathFromScope } from '../home/utils'
import { IApp } from './apps.types'

export const Pill = styled.div`
  border-radius: 7px;
  background-color: ${colors.primaryBlue};
  color: ${colors.white110};
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
`

export const useAppsColumns = ({
  colWidths,
  isAdmin = false,
  properties = [],
}: {
  colWidths: KeyVal
  isAdmin?: boolean
  properties?: string[]
}) => {
  const location = useLocation()
  const queryClient = useQueryClient()
  
  return [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: DefaultColumnFilter,
      width: colWidths?.name || 198,
      Cell: props => (
        <StyledNameCell as={Link} to={`${location.pathname}/${props.cell.row.original.uid}`} state={{ from: location.pathname, fromSearch: location.search }}>
          <CubeIcon height={14} />
          {props.value}
        </StyledNameCell>
      ),
    },
    {
      Header: 'Title',
      accessor: 'title',
      Filter: DefaultColumnFilter,
      width: colWidths?.title || 300,
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
          <FeaturedToggle resource="apps" disabled={!isAdmin} featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['apps']})} />
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
      Header: 'Explorers',
      accessor: 'explorers',
      Filter: DefaultColumnFilter,
      width: colWidths?.explorers || 100,
    },
    {
      Header: 'Org',
      accessor: 'org',
      Filter: DefaultColumnFilter,
      width: colWidths?.org || 180,
    },
    {
      Header: 'Added By',
      accessor: 'added_by',
      Filter: DefaultColumnFilter,
      width: colWidths?.added_by || 200,
      Cell: props => (
        <a data-turbolinks="false" href={props.cell.row.original.links.user}>{props.cell.row.original.added_by_fullname}</a>
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
      sortDescFirst: true,
      disableFilters: true,
      width: colWidths?.created_at_date_time || 198,
    },
    {
      Header: 'Run By You',
      accessor: 'run_by_you',
      disableFilters: true,
      width: colWidths?.run_by_you || 100,
      Cell: props => (
        <StyledRunByYouLink data-turbolinks="false" href={`${getBasePathFromScope(props.row.original.scope)}/apps/${ props.row.original.uid}/jobs/new`}><Pill>{props.value}</Pill></StyledRunByYouLink>
      ),
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
    ...properties.map(property => ({
      Header: property,
      accessor: row => row.properties[property],
      id: `props.${property}`,
      disableFilters: true,
      width: colWidths?.[property] || 200,
    })),
  ] as Column<IApp>[]
}

