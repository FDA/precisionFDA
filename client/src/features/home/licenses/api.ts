import { checkStatus, getApiRequestOpts, requestOpts } from '../../../utils/api'
import { AcceptedLicense } from '../apps/apps.types'
import { License } from './types'

export async function fetchLicense(id: string): Promise<any> {
  const res = await fetch(`/api/licenses/${id}`, {
    method: 'GET',
    ...requestOpts,
  }).then(checkStatus)
  return res.json()
}

export async function fetchAcceptedLicenses(): Promise<AcceptedLicense[]> {
  const res = await fetch('/api/licenses/accepted', {
    method: 'GET',
    ...requestOpts,
  }).then(checkStatus)
  return res.json()
}

export async function fetchLicensesForFiles(ids: number[]): Promise<License[]> {
  const res = await fetch('/api/list_licenses_for_files', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ ids }),
  }).then(checkStatus)
  return res.json()
}

export async function fetchLicensesList(): Promise<{ licenses: License[]}> {
  const res = await fetch('/api/list_licenses', {
    method: 'GET',
    ...requestOpts,
  }).then(checkStatus)
  return res.json()
}

export async function attachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<Error | {}> {
  const res = await fetch(`/api/licenses/${licenseId}/license_item/${dxid}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({}),
  }).then(checkStatus)
  return res.json()
}

export async function detachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<any> {
  const res = await fetch(`/api/licenses/${licenseId}/remove_item/${dxid}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({}),
  }).then(checkStatus)
  return res.json()
}

export async function acceptLicenseRequest({ licenseId }: { licenseId: string }): Promise<any> {
  const res = await fetch(`/api/licenses/${licenseId}/accept`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({}),
  }).then(checkStatus)
  return res.json()
}

export async function acceptLicensesRequest({ licenseIds }: { licenseIds: string[] }): Promise<any> {
  const res = await fetch('/api/accept_licenses', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ 'license_ids': licenseIds } ),
  }).then(checkStatus)
  return res.json()
}
