import axios from 'axios'
import { HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import {
  ExecutionDetail,
  ExecutionListItem,
  IJob,
  Job,
  RunData,
  RunDataUpdates,
} from './executions.types'
import { COMPUTE_RESOURCE_LABELS } from '@/types/user'

export interface FetchExecutionsQuery {
  jobs: ExecutionListItem[]
  meta: IMeta
}

/** Snake_case RunData shape as returned by the Rails API. */
interface RailsRunDataItem {
  name: string
  class: string
  label?: string
  value?: unknown
  state?: string
  scope?: string
  file_name?: string
  file_uid?: string
  file_names?: string[]
  file_uids?: string[]
  scopes?: string[]
}

/** Snake_case Job shape as returned by the Rails API (inner workflow job). */
interface RailsJob {
  id: number
  uid: string
  state: string
  name: string
  app_title: string
  app_revision: number
  app_active: boolean
  workflow_title: string
  workflow_uid: string
  run_input_data: RailsRunDataItem[]
  run_output_data: RailsRunDataItem[]
  run_data_updates: RunDataUpdates
  instance_type: keyof typeof COMPUTE_RESOURCE_LABELS
  duration: string
  duration_in_seconds: number
  energy_consumption: string
  failure_reason: string
  failure_message: string
  created_at: string
  created_at_date_time: string
  scope: string
  location: string
  launched_by: string
  launched_on: string
  featured: boolean
  entity_type: 'regular' | 'https'
  logged_dxuser: string
  tags: string[]
}

/** Snake_case IExecution shape as returned by the Rails list API. */
interface RailsExecution extends RailsJob {
  dxid: string
  title: string
  added_by: string
  workstation_api_version: string | null
  cost_limit: number
  launched_by_dxuser: string
  revision: number
  readme: string
  workflow_series_id: number | string
  version: string
  active: boolean
  snapshot: boolean
  platform_tags: string[] | null
  app_uid: string
  logged_dxuser: string
  properties: Record<string, string>
  is_publishable: boolean
  jobs?: RailsJob[]
  startedRunning?: number
  stoppedRunning?: number
  showLicensePending?: boolean
}

export async function fetchFilteredJobs(searchString: string, scopes: ServerScope[]): Promise<IJob[]> {
  return axios
    .post('/api/list_jobs', {
      scopes,
      search_string: searchString,
      describe: {
        include: {
          user: true,
          org: true,
          all_tags_list: false,
        },
      },
      offset: 0,
      limit: 1000,
    })
    .then(r => r.data as IJob[])
}

function mapRunData(data: RailsRunDataItem[]): RunData[] {
  if (!data) return []

  return data.map(item => ({
    name: item.name,
    class: item.class as RunData['class'],
    label: item.label ?? item.name,
    value: (item.value ?? '') as RunData['value'],
    state: item.state,
    scope: item.scope as RunData['scope'],
    fileName: item.file_name,
    fileUid: item.file_uid,
    fileNames: item.file_names,
    fileUids: item.file_uids,
    scopes: item.scopes as RunData['scopes'],
  }))
}

function mapJob(raw: RailsJob): Job {
  return {
    id: raw.id,
    uid: raw.uid,
    state: raw.state as Job['state'],
    name: raw.name,
    appTitle: raw.app_title,
    appRevision: raw.app_revision,
    appActive: raw.app_active,
    workflowTitle: raw.workflow_title,
    workflowUid: raw.workflow_uid,
    runInputData: mapRunData(raw.run_input_data),
    runOutputData: mapRunData(raw.run_output_data),
    runDataUpdates: raw.run_data_updates,
    instanceType: raw.instance_type,
    duration: raw.duration,
    durationInSeconds: raw.duration_in_seconds,
    energyConsumption: raw.energy_consumption,
    failureReason: raw.failure_reason,
    failureMessage: raw.failure_message,
    createdAt: raw.created_at,
    createdAtDateTime: raw.created_at_date_time,
    scope: raw.scope,
    location: raw.location,
    launchedBy: raw.launched_by,
    launchedOn: raw.launched_on,
    featured: raw.featured,
    entityType: raw.entity_type,
    loggedDxuser: raw.logged_dxuser,
    tags: raw.tags,
  }
}

function mapExecution(raw: RailsExecution): ExecutionListItem {
  return {
    id: raw.id,
    uid: raw.uid,
    state: raw.state as ExecutionListItem['state'],
    dxid: raw.dxid,
    name: raw.name,
    appRevision: raw.app_revision,
    appActive: raw.app_active,
    appUid: raw.app_uid,
    appTitle: raw.app_title,
    workstationApiVersion: raw.workstation_api_version,
    runInputData: mapRunData(raw.run_input_data),
    runOutputData: mapRunData(raw.run_output_data),
    runDataUpdates: raw.run_data_updates,
    failureMessage: raw.failure_message,
    failureReason: raw.failure_reason,
    createdAt: raw.created_at,
    createdAtDateTime: raw.created_at_date_time,
    energyConsumption: raw.energy_consumption,
    costLimit: raw.cost_limit,
    duration: raw.duration,
    durationInSeconds: raw.duration_in_seconds,
    startedRunning: raw.startedRunning,
    stoppedRunning: raw.stoppedRunning,
    showLicensePending: raw.showLicensePending,
    instanceType: raw.instance_type,
    launchedBy: raw.launched_by,
    launchedByDxuser: raw.launched_by_dxuser,
    launchedOn: raw.launched_on,
    location: raw.location,
    scope: raw.scope as ExecutionListItem['scope'],
    featured: raw.featured,
    loggedDxuser: raw.logged_dxuser,
    tags: raw.tags,
    properties: raw.properties,
    snapshot: raw.snapshot,
    entityType: raw.entity_type,
    title: raw.title,
    addedBy: raw.added_by,
    revision: raw.revision,
    readme: raw.readme,
    workflowSeriesId: raw.workflow_series_id,
    version: raw.version,
    active: raw.active,
    isPublishable: raw.is_publishable ?? false,
    jobs: raw.jobs?.map(mapJob),
    workflowUid: raw.workflow_uid,
    platformTags: raw.platform_tags,
    workflowTitle: raw.workflow_title,
  }
}

export async function fetchExecutions(filters: IFilter[], params: Params): Promise<FetchExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  const res = await axios.get<{ jobs: RailsExecution[]; meta: IMeta }>(`/api/jobs${scopeQ}${paramQ}`)
  return {
    jobs: res.data.jobs.map(mapExecution),
    meta: res.data.meta,
  }
}

export async function fetchExecution(uid: string): Promise<ExecutionDetail> {
  const res = await axios.get<ExecutionDetail>(`/api/v2/jobs/${uid}`)
  return res.data
}

export async function copyJobsRequest(scope: string, ids: string[]) {
  const res = await axios.post('/api/jobs/copy', { item_ids: ids, scope })
  return res.data
}

export async function terminateJobsRequest(ids: string[]) {
  const res = await axios.post('/api/jobs/terminate', { id: ids })
  return res.data
}

export async function workstationSnapshotRequest(
  uid: string,
  { name, terminate }: { name: string; terminate: boolean },
) {
  return axios.patch(`/api/jobs/${uid}/snapshot`, { name, terminate }).then(res => res.data)
}
