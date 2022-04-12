import { checkStatus, getApiRequestOpts, requestOpts } from "../../../utils/api";
import { IExecution } from "../executions/executions.types";
import { IFilter, IMeta, ResourceScope } from "../types";
import { Params, prepareListFetch } from "../utils";
import { FetchWorkflowRequest, IWorkflow } from "./workflows.types";

export interface FetchWorkflowListQuery {
  workflows: IWorkflow[]
  meta: IMeta
}

export async function fetchWorkflowList(filters: IFilter[], scope: ResourceScope, params: Params): Promise<FetchWorkflowListQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = scope === 'me' ? '' : scope
  const res = await fetch(`/api/workflows/${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchWorkflow(workflowUid: string): Promise<FetchWorkflowRequest> {
  const res = await (await fetch(`/api/workflows/${workflowUid}`)).json()
  return res
}

export interface FetchWorkflowExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

export async function fetchWorkflowExecutions(filters: IFilter[], uid: string, params: Params): Promise<FetchWorkflowExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const res = await fetch(`/api/workflows/${uid}/jobs${paramQ}`)
  return res.json()
}


export async function createWorkflowRequest(name: string) {
  const res = await (await fetch(`/api/workflows/`, {
    method: 'POST',
    body: JSON.stringify({ name })
  })).json()
  return res
}

export async function copyWorkflowsRequest(scope: string, ids: string[]) {
  const res = await fetch(`/api/workflows/copy`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope })
  }).then(checkStatus)
  return res.json()
}

export async function deleteWorkflowRequest(ids: string[]) {
  const res = await fetch(`/api/workflows/delete`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids })
  }).then(checkStatus)
  return res.json()
}
