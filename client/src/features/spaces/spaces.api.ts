import axios from 'axios'
import { getApiRequestOpts, requestOpts } from '../../utils/api'
import { IFilter } from '../home/types'
import { Params, prepareListFetch } from '../home/utils'
import { ISpace } from './spaces.types'


export async function fetchSpaces(filters: IFilter[], params: Params): Promise<{meta: unknown, spaces: ISpace[]}> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${  new URLSearchParams(query as Record<string, string>).toString()}`
  const res = await fetch(`/api/spaces${paramQ}`, requestOpts)
  return res.json()
}

export async function spacesListRequest(filters: IFilter[], params: Params): Promise<{meta: any, spaces: ISpace[]}> {
  const query = prepareListFetch(filters, params)
  const paramQ = `?${  new URLSearchParams(query as {}).toString()}`
  return axios.get(`/api/spaces/${paramQ}`).then(res => res.data)
}

export async function spaceRequest({ id }: { id: string }): Promise<{meta: unknown, space: ISpace}> {
  return axios.get(`/api/spaces/${id}`).then(res => res.data)
}

export async function unlockSpaceRequest({ link = '' }: { id: string, op: 'lock' | 'unlock', link?: string }): Promise<unknown> {
  // const res = await fetch(`/api/spaces/${id}/${op}`, { method: 'POST'})
  const res = await fetch(link, {
    ...getApiRequestOpts('POST'),
  })
  return res.json()
}

export async function addData({ spaceId, uids }: { spaceId: string, uids: string[] }): Promise<unknown> {
  const res = await fetch(`/api/spaces/${spaceId}/add_data/`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ uids }),
  })
  return res
}

export async function acceptSpaceRequest({ id }: { id: string }): Promise<unknown> {
  const res = await fetch(`/api/spaces/${id}/accept`, {
    ...getApiRequestOpts('POST'),
   })
  return res.json()
}

export async function addDataRequest({ spaceId, uids }: { spaceId: string, uids: string[]}): Promise<any> {
  return axios.post(`/api/spaces/${spaceId}/add_data`, {
    uids,
  }).then(res => res.data)
}

export interface CreateSpacePayload {
  name: string
  description: string
  source_space_id?: string | null
  guest_lead_dxuser?: string | null
  host_lead_dxuser?: string | null
  sponsor_lead_dxuser?: string | null
  review_lead_dxuser?: string | null
  cts?: string | null
}
export interface EditSpacePayload {
  name: string
  description: string
  cts?: string
}

export interface CreateSpaceResponse {
  space: ISpace
  error?: Error;
  errors?: {
    messages: string[]
  };
}

export interface EditableSpace {
  scope: string
  title: string
}

export type EditableSpacesResponse = EditableSpace[]

export async function fetchEditableSpacesList(): Promise<EditableSpacesResponse> {
    const res = await (await fetch('/api/spaces/editable_spaces')).json()
    return res
  }

export async function createSpaceRequest(payload: CreateSpacePayload): Promise<CreateSpaceResponse> {
  const res = await fetch('/api/spaces', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ space: payload }),
  })
  return res.json()
}

export async function editSpaceRequest(spaceId: string, payload: CreateSpacePayload): Promise<CreateSpaceResponse> {
  const res = await fetch(`/api/spaces/${spaceId}`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ space: payload }),
  })
  return res.json()
}