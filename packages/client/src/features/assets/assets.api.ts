import axios from 'axios'
import { BaseAPIResponse, BaseError, HomeScope, IFilter, IMeta, ServerScope } from '../home/types'
import { formatScopeQ, Params, prepareListFetch } from '../home/utils'
import { IAsset } from './assets.types'

export interface FetchAssetsQuery extends BaseAPIResponse {
  assets: IAsset[]
  meta: IMeta
}

export async function fetchAssets(filters: IFilter[], params: Params): Promise<FetchAssetsQuery> {
  const query = prepareListFetch(filters, params)
  const scopeQ = formatScopeQ(params.scope as HomeScope)
  const res = await axios.get(`/api/assets${scopeQ}`, { params: query })
  return res.data
}

export async function fetchFilteredAssets(searchString: string, scopes?: ServerScope[]): Promise<IAsset[]> {
  return axios.post('/api/list_assets', {
    scopes: scopes || ['public'],
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

export async function fetchAsset(uid: string): Promise<{ asset: IAsset, meta: IMeta}> {
  const res = await axios.get(`/api/assets/${uid}`)
  return res.data
}

export async function createAssetRequest(name: string) {
  const res = await axios.post('/api/assets/', { name })
  return res.data
}

export async function copyAssetsRequest(scope: string, ids: string[]) {
  const res = await axios.post('/api/assets/copy', { item_ids: ids, scope })
  return res.data
}

export async function editAssetRequest({ name, uid }:{ name: string, uid: string }): Promise<BaseError> {
  const res = await axios.post('/api/assets/rename', { title: name, id: uid })
  return res.data
}
