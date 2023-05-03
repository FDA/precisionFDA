import React, { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouteMatch } from 'react-router'
import { Column } from 'react-table'
import { FeaturedToggle } from '../../../components/FeaturedToggle'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { CogsIcon } from '../../../components/icons/Cogs'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import {
  DefaultColumnFilter,
  SelectColumnFilter,
} from '../../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { getSpaceIdFromScope } from '../../../utils'
import { StyledLinkCell } from '../home.styles'
import { KeyVal } from '../types'
import { getBasePath } from '../utils'
import { IExecution } from './executions.types'

export const useExecutionColumns = ({
  colWidths,
  isAdmin = false,
  filterDataTestIdPrefix,
}: {
  colWidths?: KeyVal,
  isAdmin?: boolean,
  // TODO(samuel) add this into .d.ts to properly solve declaration merging
  filterDataTestIdPrefix?: string | undefined

}) => {
  const queryClient = useQueryClient()
  const location = useLocation()
  const { path } = useRouteMatch()
  return useMemo<Column<IExecution>[]>(
    () =>
      [
        {
          Header: 'State',
          id: 'state',
          accessor: 'state',
          width: colWidths?.state || 100,
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          Cell: (props: any) => {
            const { jobs } = props.row.original
            if (jobs) {
              return <div>{jobs[jobs.length - 1].state}</div>
            }
              return <div>{props.row.original.state}</div>

          },
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-state` } : {}),
        },
        {
          Header: 'Execution Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 300,
          Cell: ({ cell, row, value }) => {
            const rowType = row.original.workflow_series_id ? 'workflows' : 'executions'
            const spaceId = getSpaceIdFromScope(row.original.scope)
            const pathname = `${getBasePath(spaceId)}/${rowType}/${cell.row.original.uid}`
            const to = { pathname, state: { from: location.pathname, fromSearch: location.search }}

            return row.original.jobs ? (
                <StyledLinkCell to={to}>
                  <BoltIcon height={14} />
                  {value}
                </StyledLinkCell>
              ) : (
                <StyledLinkCell to={to}>
                  <CogsIcon height={14} />
                  {value}
                </StyledLinkCell>
              )
            },
            ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-execution-name` } : {}),
          },
        {
          Header: 'Workflow',
          id: 'workflow_title',
          accessor: 'workflow_title',
          Filter: DefaultColumnFilter,
          width: colWidths?.workflow_title || 200,
          Cell: ({ row, value }) => {
            const spaceId = getSpaceIdFromScope(row.original.scope)
            if(value === 'N/A') {
              return value
            }
            return (
              <StyledLinkCell to={`${getBasePath(spaceId)}/workflows/${row.original.workflow_uid}`}>
                <BoltIcon height={14} />
                {value}
              </StyledLinkCell>
            )
          },
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-workflow-title` } : {}),
        },
        {
          Header: 'Featured',
          accessor: 'featured',
          Filter: SelectColumnFilter,
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          width: colWidths?.featured || 93,
          Cell: props => (
            <div style={{ paddingLeft: 20 }}>
              <FeaturedToggle disabled={!isAdmin} resource="jobs" featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries(['jobs'])} />
            </div>
          ),
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-featured` } : {}),
        },
        {
          Header: 'App Title',
          accessor: 'app_title',
          Filter: DefaultColumnFilter,
          width: colWidths?.app_title || 200,
          Cell: ({ row, value }) => {
            const spaceId = getSpaceIdFromScope(row.original.scope)
            if(row.original.jobs) {
              return null
            }

            return (
              <StyledLinkCell to={`${getBasePath(spaceId)}/apps/${row.original.app_uid}`}>
                <CubeIcon height={14} />
                {value}
              </StyledLinkCell>
            )
          },
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-app-title` } : {}),
        },
        {
          Header: 'Launched By',
          accessor: 'launched_by',
          Filter: DefaultColumnFilter,
          width: colWidths?.launched_by || 200,
          Cell: props => (
            <a data-turbolinks="false" href={props.row.original.links.user ?? '#'}>{props.value}</a>
          ),
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-by` } : {}),
        },
        {
          Header: 'Location',
          accessor: 'location',
          Filter: DefaultColumnFilter,
          width: colWidths?.location || 200,
          Cell: props => (
            <StyledLinkCell to={`${props.row.original.links && props.row.original.links.space}/${props.row.original.workflow_uid === 'N/A' ? 'jobs' : 'workflows'}`}>
              <ObjectGroupIcon height={14} />
              {props.value}
            </StyledLinkCell>
          ),
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-location` } : {}),
        },
        {
          Header: 'Instance Type',
          accessor: 'jobs',
          id: 'instance_type',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.instance_type || 170,
          Cell: props =>
            props.row.original.jobs ? (
              <></>
            ) : (
              <>{props.row.original.instance_type}</>
            ),
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-instance-type` } : {}),
        },
        {
          Header: 'Duration',
          accessor: 'jobs',
          id: 'duration',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.duration || 198,
          Cell: (props: any) => {
            const { jobs } = props.row.original
            if (jobs) {
              return <>{jobs[jobs.length - 1].duration}</>
            }
              return <>{props.row.original.duration}</>

          },
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-duration` } : {}),
        },
        {
          Header: 'Cost',
          accessor: 'jobs',
          id: 'energy',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.energy || 106,
          // Cell: (props) => <>{props.value[props.value.length-1].energy_consumption}</>
          Cell: (props: any) => {
            const { jobs } = props.row.original
            if (jobs) {
              return <>{jobs[jobs.length - 1].energy_consumption}</>
            }
              return <>{props.row.original.energy_consumption}</>

          },
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-energy` } : {}),
        },
        {
          Header: 'Launched On',
          accessor: 'launched_on',
          disableFilters: true,
          width: colWidths?.launched_on || 198,
          Cell: props => props.row.original.launched_on === null ? props.row.original.created_at_date_time : props.row.original.launched_on,
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-on` } : {}),
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          width: colWidths?.tags || 500,
          Cell: props => (
              <StyledTags>
                {props.value?.map(tag => (
                  <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
              </StyledTags>
            ),
          ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-tags` } : {}),
        },
      ] as Column<IExecution>[],
    [location.search],
  )
}
