import axios from 'axios'

type FetchProvenance = {
  uid: string
  name: string
  svg: string
}

export function fetchProvenanceByUid(uid: string) {
  const url = `/api/tracks/provenance?uid=${uid}`
  return axios.get<FetchProvenance>(url).then(r => r.data)
}