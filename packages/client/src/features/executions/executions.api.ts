import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IJob, IExecution } from './executions.types'

export interface FetchExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
}

export async function fetchExecutions(filters: IFilter[], params: Params): Promise<FetchExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query as {}).toString()}`
  const scopeQ = formatScopeQ(params.scope)
  const res = await fetch(`/api/jobs${scopeQ}${paramQ}`)
  return res.json()
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

export async function fetchExecution(uid: string): Promise<{ job: IExecution; meta: any }> {
  const res = await (await fetch(`/api/jobs/${uid}`)).json()
  return res
}

export async function copyJobsRequest(scope: string, ids: string[]) {
  const res = await fetch('/api/jobs/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function terminateJobsRequest(ids: string[]) {
  const res = await fetch('/api/jobs/terminate', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ id: ids }),
  }).then(checkStatus)
  return res.json()
}

export async function workstationRefreshAPIKeyRequest(dxid: string) {
  const res = await fetch(`/api/jobs/${dxid}/refresh_api_key`, {
    ...getApiRequestOpts('PATCH'),
  }).then(checkStatus)
  return res.json()
}

export async function workstationSnapshotRequest(dxid: string, { name, terminate }: { name: string; terminate: boolean }) {
  return axios.patch(`/api/jobs/${dxid}/snapshot`, { name, terminate }).then(res => res.data)
}
