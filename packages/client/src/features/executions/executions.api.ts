import axios from 'axios'
import { HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IJob, IExecution } from './executions.types'

export interface FetchExecutionsQuery {
  jobs: IExecution[]
  meta: IMeta
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
export async function fetchExecutions(filters: IFilter[], params: Params): Promise<FetchExecutionsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${new URLSearchParams(query).toString()}`
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  const res = await axios.get(`/api/jobs${scopeQ}${paramQ}`)
  return res.data
}

export async function fetchExecution(uid: string): Promise<{ job: IExecution; meta: unknown }> {
  const res = await axios.get(`/api/jobs/${uid}`)
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

export async function workstationRefreshAPIKeyRequest(dxid: string) {
  const res = await axios.patch(`/api/jobs/${dxid}/refresh_api_key`)
  return res.data
}

export async function workstationSnapshotRequest(dxid: string, { name, terminate }: { name: string; terminate: boolean }) {
  return axios.patch(`/api/jobs/${dxid}/snapshot`, { name, terminate }).then(res => res.data)
}
