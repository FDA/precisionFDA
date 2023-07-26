import axios from 'axios'
import { Pagination } from '../../types/pagination'
import { processFile } from '../resources/uploadImage'
import { DataPortal } from './types'

export interface DataPortalListResponse {
  dataPortals: DataPortal[]
  meta: Pagination
}

export async function fetchGovUsers(): Promise<[]> {
  return axios.get('/api/users/government').then(r => r.data)
}

export async function fetchActiveUsers(): Promise<[]> {
  return axios.get('/api/users/active').then(r => r.data)
}

export async function dataPortalsListRequest() {
  return axios.get('/api/data_portals').then(res => res.data.data_portals as DataPortal[])
}

export async function dataPortalByIdRequest(id: string) {
  return axios.get(`/api/data_portals/${id}`).then(res => res.data as DataPortal)
}

export async function fetchMainDataPortal() {
  return axios.get('/api/data_portals/default').then(res => res.data as DataPortal)
}

export async function createDataPortalImage(file: File, portalId: number) {
  const response = await axios.post(`/api/data_portals/${portalId}/card_image`, { name: file.name })
  const fileUid = response.data

  await processFile(file, fileUid)
  return fileUid
}

export interface CreateDataPortalRequest {
  card_image_uid: string
  name: string
  description?: string
  status: string
  host_lead_dxuser: string
  guest_lead_dxuser: string
}
export interface EditDataPortalRequest {
  name?: string
  description?: string
  card_image_uid?: string
  image?: File
  status?: string
  sort_order?: number
  default?: boolean
}

export async function updateDataPortalRequest(payload: CreateDataPortalRequest | EditDataPortalRequest, id: number | string) {
  return axios.patch(`/api/data_portals/${id}`, payload).then(res => res.data as DataPortal)
}

export async function editDataPortalRequest({ image, ...payload }: EditDataPortalRequest, id: number) {
  const body = payload
  if(image) {
    const portalImage = await createDataPortalImage(image, id)
    body.card_image_uid = portalImage
  }
  return updateDataPortalRequest(body, id)
}

export async function createDataPortalRequest({ image, ...payload }: CreateDataPortalRequest) {
  const portal = await axios.post('/api/data_portals', payload).then(res => res.data as DataPortal)
  const portalImage = await createDataPortalImage(image, portal.id)
  return updateDataPortalRequest({ card_image_uid: portalImage }, portal.id)
}

