import { checkStatus, getApiRequestOpts, requestOpts } from "../../../utils/api"
import { License } from "./types"

export async function fetchLicensesList(): Promise<{ licenses: License[]}> {
  const res = await fetch(`/api/list_licenses`, {
    method: 'GET',
    ...requestOpts,
  }).then(checkStatus)
  return res.json()
}

export async function attachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<Error | {}> {
  const res = await fetch(`/api/licenses/${licenseId}/license_item/${dxid}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({})
  }).then(checkStatus)
  return res.json()
}

export async function detachLicenseRequest({ licenseId, dxid }: { licenseId: string, dxid: string }): Promise<any> {
  const res = await fetch(`/api/licenses/${licenseId}/remove_item/${dxid}`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({})
  }).then(checkStatus)
  return res.json()
}

export async function acceptLicenseRequest({ licenseId }: { licenseId: string }): Promise<any> {
  const res = await fetch(`/api/licenses/${licenseId}/accept`, {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({})
  }).then(checkStatus)
  return res.json()
}
