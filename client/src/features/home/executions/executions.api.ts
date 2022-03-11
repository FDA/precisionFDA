import { checkStatus, requestOpts } from "../../../utils/api";
import { IFilter, IMeta, ResourceScope } from "../types";
import { Params, prepareListFetch } from "../utils";
import { IExecution } from "./executions.types";


export interface FetchExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

export async function fetchExecutions(filters: IFilter[], scope: ResourceScope, params: Params): Promise<FetchExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = scope === 'me' ? '' : scope
  const res = await fetch(`/api/jobs/${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchExecution(uid: string): Promise<{ job: IExecution, meta: any}> {
  const res = await (await fetch(`/api/jobs/${uid}`)).json()
  return res
}

export async function copyJobsRequest(scope: string, ids: string[]) {
  const res = await fetch(`/api/jobs/copy`, {
    ...requestOpts,
    method: 'POST',
    body: JSON.stringify({ item_ids: ids, scope })
  }).then(checkStatus)
  return res.json()
}

export async function terminateJobsRequest(id: string) {
  const res = await fetch(`/api/jobs/terminate`, {
    ...requestOpts,
    method: 'POST',
    body: JSON.stringify({ id })
  }).then(checkStatus)
  return res.json()
}

export async function syncFilesRequest(link: string) {
  const res = await fetch(link, {
    ...requestOpts,
    method: 'PATCH',
  }).then(checkStatus)
  return res.json()
}
