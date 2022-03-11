import { checkStatus, requestOpts } from "../../../utils/api";
import { BaseAPIResponse, BaseError, IFilter, IMeta, ResourceScope } from "../types";
import { Params, prepareListFetch } from "../utils";
import { IAsset } from "./assets.types";

export interface FetchAssetsQuery extends BaseAPIResponse {
  apps: IAsset[]
  meta: IMeta
}

export async function fetchAssets(filters: IFilter[], scope: ResourceScope, params: Params): Promise<FetchAssetsQuery> {
  const query = prepareListFetch(filters, params)
  const paramQ = '?' + new URLSearchParams(query as {}).toString()
  const scopeQ = scope === 'me' ? '' : scope
  const res = await fetch(`/api/assets/${scopeQ}${paramQ}`)
  return res.json()
}

export async function fetchAsset(uid: string): Promise<{ asset: IAsset, meta: any}> {
  const res = await fetch(`/api/assets/${uid}`)
  return res.json()
}

export async function createAssetRequest(name: string) {
  const res = await fetch(`/api/assets/`, {
    method: 'POST',
    body: JSON.stringify({ name })
  })
  return res.json()
}

export async function copyAssetsRequest(scope: string, ids: string[]) {
  const res = await fetch(`/api/assets/copy`, {
    ...requestOpts,
    method: 'POST',
    body: JSON.stringify({ item_ids: ids, scope })
  }).then(checkStatus)
  return res.json()
}

export async function editAssetRequest({ name, uid }:{ name: string, uid: string }): Promise<BaseError> {
  const res = await fetch(`/api/assets/rename`, {
    method: 'POST',
    ...requestOpts,
    body: JSON.stringify({ title: name, id: uid })
  })
  return res.json()
}

export async function deleteAssetsRequest(ids: string[]): Promise<any> {
  const res = await fetch(`/api/assets/${ids[0]}`, {
    method: 'DELETE',
    ...requestOpts,
  }).then(checkStatus)
  return res.json()
}
