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
  return axios.get('/api/v2/data-portals').then(res => res.data as DataPortal[])
}

export async function dataPortalByIdRequest(id: string) {
  return axios.get(`/api/v2/data-portals/${id}`).then(res => res.data as DataPortal)
}

export interface CreateDataPortalRequest {
  name: string
  description?: string
  urlSlug: string
  hostLeadDxUser: string
  guestLeadDxUser: string
  cardImageFileName: string
  sortOrder: number
}

export interface UpdateDataPortalRequest {
  id: number
  name?: string
  description?: string
  sortOrder?: number
  cardImageUid?: string
  content?: string
  editorState?: string
}

export async function updateDataPortalRequest(payload: UpdateDataPortalRequest) {
  return axios.patch(`/api/v2/data-portals/${payload.id}`, payload).then(res => res.data as DataPortal)
}

export async function editDataPortalRequest(dataPortalData : UpdateDataPortalData) {
  const { dataPortal } = dataPortalData
  if (dataPortalData.image && dataPortalData.spaceId) {
    const cardImage = await createFile(dataPortalData.image.name, `space-${dataPortalData.spaceId}`, null)
    await processFile(dataPortalData.image, cardImage.id)
    dataPortal.cardImageUid = cardImage.id // TODO fix some day when rewriting create_file on backend
  }
  return updateDataPortalRequest(dataPortal)
}

export async function createDataPortalRequest(dataPortalData: CreateDataPortalData) {
  const createPortalResponse = await axios.post('/api/v2/data-portals', dataPortalData.dataPortal).then(res => res.data as DataPortal)
  if (!createPortalResponse.error) {
    await processFile(dataPortalData.image, createPortalResponse.cardImageUid)
  }
  return createPortalResponse
}
