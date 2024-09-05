import axios from 'axios'
import { createFile } from '../files/files.api'
import { processFile } from '../resources/uploadImage'
import { DataPortal, CreateDataPortalData, UpdateDataPortalData } from './types'

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

export interface CreateDataPortalRequest {
  card_image_uid?: string
  name: string
  description?: string
  url_slug: string
  status: string
  host_lead_dxuser: string
  guest_lead_dxuser: string
  card_image_file_name: string
}

export interface UpdateDataPortalRequest {
  id: number
  name?: string
  description?: string
  sort_order?: number
  card_image_uid?: string
  status?: string
  content?: string
  editor_state?: string
}

export async function updateDataPortalRequest(payload: UpdateDataPortalRequest) {
  return axios.patch(`/api/data_portals/${payload.id}`, payload).then(res => res.data as DataPortal)
}

export async function editDataPortalRequest(dataPortalData : UpdateDataPortalData) {
  const { dataPortal } = dataPortalData
  if (dataPortalData.image && dataPortalData.spaceId) {
    const cardImage = await createFile(dataPortalData.image.name, `space-${dataPortalData.spaceId}`, null)
    await processFile(dataPortalData.image, cardImage.id)
    dataPortal.card_image_uid = cardImage.id // TODO fix some day when rewriting create_file on backend
  }
  return updateDataPortalRequest(dataPortal)
}

export async function createDataPortalRequest(dataPortalData: CreateDataPortalData) {
  const createPortalResponse = await axios.post('/api/data_portals', dataPortalData.dataPortal).then(res => res.data as DataPortal)
  if (!createPortalResponse.error) {
    await processFile(dataPortalData.image, createPortalResponse.cardImageUid)
  }
  return createPortalResponse
}
