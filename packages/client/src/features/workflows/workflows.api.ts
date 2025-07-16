import axios from 'axios'
import { IExecution } from '../executions/executions.types'
import { License } from '../licenses/types'
import { IFilter, IMeta } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { FetchWorkflowRequest, IWorkflow, WorkflowMeta } from './workflows.types'

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
  if(res.data.failure) throw new Error(res.data.failure)
  return res.data
}

export async function fetchWorkflowList(filters: IFilter[], params: Params): Promise<FetchWorkflowListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query).toString()
  const scopeQ = formatScopeQ(params.scope)
  const res = await axios.get(`/api/workflows${scopeQ}${paramQ}`)
  return res.data
}

export async function fetchLicensesOnWorkflow(workflowUid: string) {
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

export async function fetchWorkflowExecutions(filters: IFilter[], params: WorkflowExecutionParams): Promise<FetchWorkflowExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  const res = await axios.get(`/api/workflows/${params.uid}/jobs${paramQ}`)
  return res.data
}

export async function createWorkflowRequest(name: string) {
  const res = await axios.post('/api/workflows/', { name })
  return res.data
}

export async function copyWorkflowsRequest(scope: string, ids: string[], properties?: Record<string, unknown>) {
  return axios.post('/api/workflows/copy', { item_ids: ids, scope, properties }).then(r => r.data)
}

export async function deleteWorkflowRequest(ids: string[]) {
  const res = await axios.post('/api/workflows/delete', { item_ids: ids })
  return res.data
}
