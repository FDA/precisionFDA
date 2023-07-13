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

export async function createDataPortalImage(file: File, portalId: number) {
  const response = await axios.post(`/api/data_portals/${portalId}/card_image`, { name: file.name })
  const fileUid = response.data

  await processFile(file, fileUid)
  return fileUid
}

export interface CreateDataPortalRequest {
  content?: string
  editor_state?: string
  image?: string
  card_image_uid?: string
}

export async function updateDataPortalRequest(payload: CreateDataPortalRequest, id: number | string) {
  return axios.patch(`/api/data_portals/${id}`, payload).then(res => res.data as DataPortal)
}

export async function editDataPortalRequest({ image, ...payload }: any, id: number) {
  const body = payload
  if(image) {
    const portalImage = await createDataPortalImage(image, id)
    body.card_image_uid = portalImage
  }
  await updateDataPortalRequest(body, id)
}

export async function createDataPortalRequest({ image, ...payload }: CreateDataPortalRequest) {
  const portal = await axios.post('/api/data_portals', payload).then(res => res.data as DataPortal)
  const portalImage = await createDataPortalImage(image, portal.id)
  await updateDataPortalRequest({ card_image_uid: portalImage }, portal.id)
}

