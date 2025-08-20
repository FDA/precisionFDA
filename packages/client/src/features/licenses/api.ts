import axios from 'axios'
import { AcceptedLicense } from '../apps/apps.types'
import { License } from './types'
import { FileUid } from '../files/files.types'

export async function fetchLicense(id: string): Promise<unknown> {
  const res = await axios.get(`/api/licenses/${id}`)
  return res.data
}

export async function fetchAcceptedLicenses(): Promise<AcceptedLicense[]> {
  const res = await axios.get('/api/licenses/accepted')
  return res.data
}

export async function fetchLicensesForFiles(uids: FileUid[]) {
  return axios.post<License[]>('/api/v2/licenses/files', { uids }).then(r => r.data )
}

export async function fetchLicensesList(): Promise<{ licenses: License[]}> {
  return axios.get('/api/list_licenses').then(r => r.data as { licenses: License[] })
}

export async function attachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<unknown> {
  const res = await axios.post(`/api/licenses/${licenseId}/license_item/${dxid}`, {})
  return res.data
}

export async function detachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<unknown> {
  const res = await axios.post(`/api/licenses/${licenseId}/remove_item/${dxid}`, {})
  return res.data
}

export async function acceptLicenseRequest({ licenseId }: { licenseId: string }): Promise<unknown> {
  const res = await axios.post(`/api/licenses/${licenseId}/accept`, {})
  return res.data
}

export async function acceptLicensesRequest({ licenseIds }: { licenseIds: string[] }): Promise<{ accepted_licenses: unknown[]}> {
  const res = await axios.post('/api/accept_licenses', { 'license_ids': licenseIds })
  return res.data
}
