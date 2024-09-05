import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import { DefaultColumnFilter, SelectColumnFilter } from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { RESOURCE_LABELS } from '../../types/user'
import { getSpaceIdFromScope } from '../../utils'
import { StyledLinkCell } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { getBasePath, getBasePathFromScope } from '../home/utils'
import { StateCell } from './StateCell'
import { IExecution } from './executions.types'

export const useExecutionColumns = ({
  colWidths,
  isAdmin = false,
  filterDataTestIdPrefix,
  properties = [],
}: {
  colWidths?: KeyVal
  isAdmin?: boolean
  // TODO(samuel) add this into .d.ts to properly solve declaration merging
  filterDataTestIdPrefix?: string | undefined
  properties?: string[]
}) => {
  const location = useLocation()
  const queryClient = useQueryClient()
  return [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: DefaultColumnFilter,
      width: colWidths?.name || 300,
      Cell: ({ cell, row, value }) => {
        const rowType = row.original.workflow_series_id ? 'workflows' : 'executions'
        const spaceId = getSpaceIdFromScope(row.original.scope)
        const pathname = `${getBasePath(spaceId)}/${rowType}/${cell.row.original.uid}`

        return rowType === 'workflows' ? (
          <StyledLinkCell to={pathname} state={{ from: location.pathname, fromSearch: location.search }}>
            <BoltIcon width={14} height={14} />
            {value}
          </StyledLinkCell>
        ) : (
          <StyledLinkCell to={pathname} state={{ from: location.pathname, fromSearch: location.search }}>
            <CogsIcon height={14} />
            {value}
          </StyledLinkCell>
        )
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-execution-name` } : {}),
    },
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
          return <StateCell state={jobs[jobs.length - 1].state} />
        }
        return <StateCell state={props.row.original.state} />
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-state` } : {}),
    },
    {
      Header: 'Workflow',
      id: 'workflow_title',
      accessor: 'workflow_title',
      Filter: DefaultColumnFilter,
      width: colWidths?.workflow_title || 200,
      Cell: ({ row, value }) => {
        const spaceId = getSpaceIdFromScope(row.original.scope)
        if (value === 'N/A') {
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
          <FeaturedToggle
            disabled={!isAdmin}
            resource="jobs"
            featured={props.cell.row.original.featured}
            uids={[props.cell.row.original.uid]}
            onSuccess={() =>
              queryClient.invalidateQueries({
                queryKey: ['jobs'],
              })
            }
          />
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
        if (row.original.jobs) {
          return null
        }

        return (
          <StyledLinkCell to={`${getBasePath(spaceId)}/apps/${row.original.app_uid}`} disable={!row.original.app_active}>
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
        <a data-turbolinks="false" href={props.row.original.links.user ?? '#'}>
          {props.value}
        </a>
      ),
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-by` } : {}),
    },
    {
      Header: 'Location',
      accessor: 'location',
      Filter: DefaultColumnFilter,
      width: colWidths?.location || 200,
      Cell: props => (
        <StyledLinkCell
          to={`${getBasePathFromScope(props.row.original.scope)}/executions`}
        >
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
          <>{RESOURCE_LABELS[props.row.original.instance_type] ?? props.row.original.instance_type}</>
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
      Cell: props =>
        props.row.original.launched_on === null ? props.row.original.created_at_date_time : props.row.original.launched_on,
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-on` } : {}),
    },
    {
      Header: 'Tags',
      accessor: 'tags',
      Filter: DefaultColumnFilter,
      disableSortBy: true,
      width: colWidths?.tags || 500,
      Cell: props => <StyledTags>{props.value?.map(tag => <StyledTagItem key={tag}>{tag}</StyledTagItem>)}</StyledTags>,
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-tags` } : {}),
    },
    ...properties.map(property => ({
      Header: property,
      accessor: row => row.properties[property],
      id: `props.${property}`,
      disableFilters: true,
      width: colWidths?.[property] || 200,
    })),
  ] as Column<IExecution>[]
}
