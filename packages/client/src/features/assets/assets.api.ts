import axios from 'axios'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { BaseAPIResponse, BaseError, IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IAsset } from './assets.types'

export interface FetchAssetsQuery extends BaseAPIResponse {
  apps: IAsset[]
  meta: IMeta
}

export async function fetchAssets(filters: IFilter[], params: Params): Promise<FetchAssetsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${  new URLSearchParams(query as {}).toString()}`
  const scopeQ = formatScopeQ(params.scope)
  const res = await fetch(`/api/assets${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchFilteredAssets(searchString: string, scopes: ServerScope[]): Promise<IAsset[]> {
  return axios.post('/api/list_assets', {
    scopes,
    search_string: searchString,
    states: ['closed'],
    describe: {
      include: {
        user: true,
        org: true,
        all_tags_list: false,
      },
    },
    offset: 0,
    limit: 1000,
  }).then(r => r.data as IAsset[])
}

export async function fetchAsset(uid: string): Promise<{ asset: IAsset, meta: any}> {
  const res = await fetch(`/api/assets/${uid}`)
  return res.json()
}

export async function createAssetRequest(name: string) {
  const res = await fetch('/api/assets/', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export async function copyAssetsRequest(scope: string, ids: string[]) {
  const res = await fetch('/api/assets/copy', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ item_ids: ids, scope }),
  }).then(checkStatus)
  return res.json()
}

export async function editAssetRequest({ name, uid }:{ name: string, uid: string }): Promise<BaseError> {
  const res = await fetch('/api/assets/rename', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ title: name, id: uid }),
  })
  return res.json()
}

export async function deleteAssetsRequest(ids: string[]): Promise<any> {
  const res = await fetch(`/api/assets/${ids[0]}`, {
    ...getApiRequestOpts('DELETE'),
  }).then(checkStatus)
  return res.json()
}
