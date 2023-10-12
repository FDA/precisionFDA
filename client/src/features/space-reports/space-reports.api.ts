import axios from 'axios'
import { ISpaceReport } from './space-report.types'

export async function createReport(spaceId: number) {
  return axios.post<number>(`/api/spaces/${spaceId}/report`).then(res => res.data)
}

export async function fetchReports(params: { spaceId: string }) {
  return axios.get<ISpaceReport[]>(`/api/spaces/${params.spaceId}/report`).then(res => res.data)
}

export async function deleteReports(ids: number[]): Promise<number[]> {
  const query = new URLSearchParams(ids.map(s=>['id', String(s)]))

  return axios.delete<number[]>(`/api/spaces/report?${query.toString()}`).then(res => res.data)
}
