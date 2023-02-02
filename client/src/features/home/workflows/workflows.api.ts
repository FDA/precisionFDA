import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../../utils/api'
import { IExecution } from '../executions/executions.types'
import { License } from '../licenses/types'
import { IFilter, IMeta } from '../types'
import { formatScopeQ, Params, prepareListFetch } from '../utils'
import { FetchWorkflowRequest, IWorkflow } from './workflows.types'

export interface FetchWorkflowListQuery {
  workflows: IWorkflow[]
  meta: IMeta
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
  const res = await (await fetch('/api/run_workflow', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify(request),
  })).json()
  if(res.failure) throw new Error(res.failure)
  return res
}

export async function fetchWorkflowList(filters: IFilter[], params: Params): Promise<FetchWorkflowListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = formatScopeQ(params.scope)
  const res = await fetch(`/api/workflows${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchLicensesOnWorkflow(workflowUid: string) {
  return axios.get(`/api/workflows/${workflowUid}/licenses_to_accept`).then(r => r.data as License[])
}

export async function fetchWorkflow(workflowUid: string) {
  return axios.get(`/api/workflows/${workflowUid}`).then(r => r.data as FetchWorkflowRequest[])
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
  const paramQ = `?${new URLSearchParams(query as any).toString()}`
  const res = await fetch(`/api/workflows/${params.uid}/jobs${paramQ}`).then(checkStatus)
  return res.json()
}


export async function createWorkflowRequest(name: string) {
  const res = await (await fetch('/api/workflows/', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })).json()
  return res
}

export async function copyWorkflowsRequest(scope: string, ids: string[]) {
  const res = await fetch('/api/workflows/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function deleteWorkflowRequest(ids: string[]) {
  const res = await fetch('/api/workflows/delete', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids }),
  }).then(checkStatus)
  return res.json()
}
