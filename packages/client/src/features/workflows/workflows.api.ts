import axios from 'axios'
import type { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import type { CopyToSpaceProperties } from '../actionModals/useCopyToSpace'
import type { IExecution, Job } from '../executions/executions.types'
import type { ApiResponse, HomeScope, IFilter, IMeta } from '../home/types'
import { formatScopeQ, type Params, prepareListFetch } from '../home/utils'
import type { License } from '../licenses/types'
import type { FetchWorkflowRequest, IWorkflow, WorkflowMeta } from './workflows.types'

/** Snake_case shape returned by SimpleJobSerializer (workflow sub-jobs). */
interface RailsSimpleJob {
  id: number
  uid: string
  state: string
  name: string
  app_title: string
  app_uid: string
  app_active: boolean
  workflow_uid: string
  duration: string
  duration_in_seconds: number
  energy_consumption: string
  instance_type: keyof typeof COMPUTE_RESOURCE_LABELS
  launched_on: string
  launched_by: string
  created_at_date_time: string
  location: string
  logged_dxuser: string
  scope: string
  tags: string[]
}

/** Snake_case shape returned by AnalysisSerializer (workflow execution parent row). */
interface RailsAnalysis {
  id: number
  uid: string
  dxid: string
  name: string
  active: boolean
  app_title: string
  added_by: string
  created_at: string
  featured: boolean
  workflow_series_id: number | string
  workflow_title: string
  launched_by: string
  launched_on: string
  location: string
  revision: number
  version: string
  jobs: RailsSimpleJob[]
}

function mapSimpleJob(raw: RailsSimpleJob): Job {
  return {
    id: raw.id,
    uid: raw.uid,
    state: raw.state as Job['state'],
    name: raw.name,
    appTitle: raw.app_title,
    appRevision: 0,
    appActive: raw.app_active,
    workflowTitle: '',
    workflowUid: raw.workflow_uid,
    runInputData: [],
    runOutputData: [],
    runDataUpdates: {} as Job['runDataUpdates'],
    instanceType: raw.instance_type,
    duration: raw.duration,
    durationInSeconds: raw.duration_in_seconds,
    energyConsumption: raw.energy_consumption,
    failureReason: '',
    failureMessage: '',
    createdAt: '',
    createdAtDateTime: raw.created_at_date_time,
    scope: raw.scope ?? '',
    location: raw.location,
    launchedBy: raw.launched_by ?? '',
    launchedOn: raw.launched_on,
    featured: false,
    entityType: 'regular',
    loggedDxuser: raw.logged_dxuser,
    tags: raw.tags ?? [],
  }
}

function mapWorkflowExecution(raw: RailsAnalysis): IExecution {
  return {
    id: raw.id,
    uid: raw.uid,
    dxid: raw.dxid,
    state: '' as IExecution['state'],
    name: raw.name,
    appTitle: raw.app_title,
    appRevision: null,
    appActive: raw.active,
    appUid: null,
    workstationApiVersion: null,
    runInputData: [],
    runOutputData: [],
    createdAt: raw.created_at,
    createdAtDateTime: raw.launched_on,
    energyConsumption: '',
    costLimit: null,
    duration: '',
    durationInSeconds: 0,
    instanceType: '' as IExecution['instanceType'],
    launchedBy: raw.launched_by,
    launchedByDxuser: '',
    launchedOn: raw.launched_on,
    location: raw.location,
    scope: '' as IExecution['scope'],
    featured: raw.featured,
    loggedDxuser: '',
    tags: [],
    properties: {},
    snapshot: false,
    entityType: 'regular',
    platformTags: null,
    jobs: raw.jobs?.map(mapSimpleJob),
    workflowSeriesId: raw.workflow_series_id,
    workflowTitle: raw.workflow_title,
  } as IExecution
}

export interface FetchWorkflowListQuery {
  workflows: IWorkflow[]
  meta: WorkflowMeta
}

export interface RunWorkflowInput {
  class: string
  input_name: string
  input_value: string | boolean | undefined
}
export interface RunWorkflowRequest {
  name: string
  inputs: RunWorkflowInput[]
  workflow_id: string
  job_limit: number
  space_id: string
}

interface RunWorkflowResponse {
  id: string // id of started workflow
  error?: Error
}

export async function runWorkflow(request: RunWorkflowRequest): Promise<RunWorkflowResponse> {
  const res = await axios.post('/api/run_workflow', request)
  if (res.data.failure) throw new Error(res.data.failure)
  return res.data
}

export async function fetchWorkflowList(filters: IFilter[], params: Params): Promise<FetchWorkflowListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query).toString()
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  const res = await axios.get(`/api/workflows${scopeQ}${paramQ}`)
  return res.data
}

export async function fetchLicensesOnWorkflow(workflowUid: string): Promise<License[]> {
  return axios.get(`/api/workflows/${workflowUid}/licenses_to_accept`).then(r => r.data as License[])
}

export async function fetchWorkflow(workflowUid: string) {
  return axios.get(`/api/workflows/${workflowUid}`).then(r => r.data as FetchWorkflowRequest)
}

export interface FetchWorkflowExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

interface WorkflowExecutionParams extends Params {
  uid: string
}

export async function fetchWorkflowExecutions(
  filters: IFilter[],
  params: WorkflowExecutionParams,
): Promise<FetchWorkflowExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  const res = await axios.get(`/api/workflows/${params.uid}/jobs${paramQ}`)
  return {
    jobs: (res.data.jobs ?? []).map(mapWorkflowExecution),
    meta: res.data.meta,
  }
}

export async function createWorkflowRequest(name: string): Promise<void> {
  const res = await axios.post('/api/workflows/', { name })
  return res.data
}

export interface WorkflowCopyResponse extends ApiResponse {
  workflows?: Array<{ uid: string }>
}

export async function copyWorkflowsRequest(
  scope: string,
  ids: string[],
  properties?: CopyToSpaceProperties,
): Promise<WorkflowCopyResponse> {
  return axios.post('/api/workflows/copy', { item_ids: ids, scope, properties }).then(r => r.data)
}

export async function deleteWorkflowRequest(ids: string[]): Promise<void> {
  const res = await axios.post('/api/workflows/delete', { item_ids: ids })
  return res.data
}
