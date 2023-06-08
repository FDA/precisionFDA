import { checkStatus, getApiRequestOpts } from "../../../utils/api";
import { IFilter, IMeta, ResourceScope } from "../types";
import { formatScopeQ, Params, prepareListFetch } from "../utils";
import { IExecution } from "./executions.types";


export interface FetchExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

export async function fetchExecutions(filters: IFilter[], params: Params): Promise<FetchExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = formatScopeQ(params.scope)
  const res = await fetch(`/api/jobs${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchExecution(uid: string): Promise<{ job: IExecution, meta: any}> {
  const res = await (await fetch(`/api/jobs/${uid}`)).json()
  return res
}

export async function copyJobsRequest(scope: string, ids: string[]) {
  const res = await fetch(`/api/jobs/copy`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope })
  }).then(checkStatus)
  return res.json()
}

export async function terminateJobsRequest(ids: string[]) {
  const res = await fetch(`/api/jobs/terminate`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ id: ids })
  }).then(checkStatus)
  return res.json()
}



export async function syncFilesRequest(link: string) {
  const res = await fetch(link, {
    ...getApiRequestOpts('PATCH'),
  }).then(checkStatus)
  return res.json()
}
