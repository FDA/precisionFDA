import { useQueryClient } from '@tanstack/react-query'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { useLocation } from 'react-router'
import { FeaturedToggle } from '@/components/FeaturedToggle'
import { BoltIcon } from '@/components/icons/BoltIcon'
import { CubeIcon } from '@/components/icons/CubeIcon'
import { NetworkIcon } from '@/components/icons/NetworkIcon'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { expanderColumnDef } from '@/components/Table/expanderColumnDef'
import { propertiesColumnDef, selectColumnDef } from '@/components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '@/components/Tags'
import { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import { getSpaceIdFromScope } from '@/utils'
import SelectFilter, { selectFilterFn } from '../../components/Table/components/SelectFilter'
import { StyledLinkCell } from '../home/home.styles'
import { getBasePath, getBasePathFromScope } from '../home/utils'
import type { IExecution } from './executions.types'
import { getUserLink } from './executions.util'
import { StateCell } from './StateCell'

export const useExecutionColumns = ({
  isAdmin = false,
  filterDataTestIdPrefix,
  properties = [],
}: {
  isAdmin?: boolean
  filterDataTestIdPrefix?: string | undefined
  properties?: string[]
}): ColumnDef<IExecution>[] => {
  const location = useLocation()
  const queryClient = useQueryClient()
  return [
    selectColumnDef(),
    expanderColumnDef(),
    {
      header: 'Name',
      enableHiding: false,
      accessorKey: 'name',
      filterFn: 'includesString',
      size: 300,
      cell: ({ row }) => {
        const rowType = row.original.workflowSeriesId ? 'workflows' : 'executions'
        const spaceId = getSpaceIdFromScope(row.original.scope)
        const pathname = `${getBasePath(spaceId)}/${rowType}/${row.original.uid}`

        return rowType === 'workflows' ? (
          row.original.name
        ) : (
          <StyledLinkCell to={pathname} state={{ from: location.pathname, fromSearch: location.search }}>
            <BoltIcon height={14} />
            {row.original.name}
          </StyledLinkCell>
        )
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-execution-name` } : {}),
    },
    {
      header: 'State',
      id: 'state',
      accessorKey: 'state',
      size: 100,
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<IExecution>) => (
          <SelectFilter
            column={column}
            options={[
              { label: 'done', option: 'done' },
              { label: 'idle', option: 'idle' },
              { label: 'runnable', option: 'runnable' },
              { label: 'running', option: 'running' },
              { label: 'terminating', option: 'terminating' },
              { label: 'terminated', option: 'terminated' },
              { label: 'failed', option: 'failed' },
            ]}
          />
        ),
      },
      enableSorting: false,
      cell: props => {
        const { jobs } = props.row.original
        if (jobs) {
          return <StateCell state={jobs[jobs.length - 1].state} />
        }
        return <StateCell state={props.row.original.state} />
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-state` } : {}),
    },
    {
      header: 'Workflow',
      id: 'workflowTitle',
      accessorKey: 'workflowTitle',
      filterFn: 'includesString',
      size: 200,
      cell: ({ row }) => {
        const rowType = row.original.workflowSeriesId ? 'workflows' : 'executions'
        const value = row.original.workflowTitle
        const spaceId = getSpaceIdFromScope(row.original.scope)
        const pathname = `${getBasePath(spaceId)}/${rowType}/${row.original.uid}`
        if (value === 'N/A') {
          return value
        }
        if (rowType === 'executions') {
          return
        }
        return (
          <StyledLinkCell to={pathname} state={{ from: location.pathname, fromSearch: location.search }}>
            <NetworkIcon height={16} />
            {value}
          </StyledLinkCell>
        )
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-workflow-title` } : {}),
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
      header: 'App Title',
      accessorKey: 'appTitle',
      filterFn: 'includesString',
      size: 200,
      cell: ({ row }) => {
        const spaceId = getSpaceIdFromScope(row.original.scope)
        if (row.original.jobs) {
          return null
        }

        return (
          <StyledLinkCell to={`${getBasePath(spaceId)}/apps/${row.original.appUid}`} $disable={!row.original.appActive}>
            <CubeIcon height={14} />
            {row.original.appTitle}
          </StyledLinkCell>
        )
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-app-title` } : {}),
    },
    {
      header: 'Launched By',
      accessorKey: 'launchedBy',
      filterFn: 'includesString',
      size: 200,
      cell: props => (
        <a data-turbolinks="false" href={getUserLink(props.row.original.launchedByDxuser)}>
          {props.row.original.launchedBy}
        </a>
      ),
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-by` } : {}),
    },
    {
      header: 'Location',
      accessorKey: 'location',
      filterFn: 'includesString',
      size: 200,
      cell: props => (
        <StyledLinkCell to={`${getBasePathFromScope(props.row.original.scope)}/executions`}>
          <ObjectGroupIcon height={14} />
          {props.row.original.location}
        </StyledLinkCell>
      ),
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-location` } : {}),
    },
    {
      header: 'Instance Type',
      accessorKey: 'jobs',
      id: 'instanceType',
      enableColumnFilter: false,
      enableSorting: false,
      size: 170,
      cell: props =>
        props.row.original.jobs ? (
          <></>
        ) : (
          (COMPUTE_RESOURCE_LABELS[props.row.original.instanceType] ?? props.row.original.instanceType)
        ),
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-instance-type` } : {}),
    },
    {
      header: 'Duration',
      accessorKey: 'jobs',
      id: 'duration',
      enableColumnFilter: false,
      enableSorting: false,
      size: 198,
      cell: props => {
        const { jobs } = props.row.original
        if (jobs) {
          return <>{jobs[jobs.length - 1].duration}</>
        }
        return <>{props.row.original.duration}</>
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-duration` } : {}),
    },
    {
      header: 'Cost',
      accessorKey: 'jobs',
      id: 'energy',
      enableColumnFilter: false,
      enableSorting: true,
      size: 106,
      cell: props => {
        const { jobs } = props.row.original
        if (jobs) {
          return <>{jobs[jobs.length - 1].energyConsumption}</>
        }
        return <>{props.row.original.energyConsumption}</>
      },
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-energy` } : {}),
    },
    {
      header: 'Launched On',
      accessorKey: 'launchedOn',
      enableColumnFilter: false,
      size: 198,
      cell: props =>
        props.row.original.launchedOn === null ? props.row.original.createdAtDateTime : props.row.original.launchedOn,
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-launched-on` } : {}),
    },
    {
      header: 'Tags',
      enableHiding: true,
      accessorKey: 'tags',
      filterFn: 'includesString',
      enableSorting: false,
      size: 500,
      cell: props => (
        <StyledTags>
          {props.row.original.tags?.map(tag => (
            <StyledTagItem key={tag}>{tag}</StyledTagItem>
          ))}
        </StyledTags>
      ),
      ...(filterDataTestIdPrefix ? { filterDataTestId: `${filterDataTestIdPrefix}-tags` } : {}),
    },
    ...propertiesColumnDef<IExecution>(properties),
  ]
}
