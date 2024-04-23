import axios from 'axios'
import { ISpaceReport, SpaceReportFormat, SpaceReportFormatToOptionsMap } from './space-report.types'

export async function createReport<T extends SpaceReportFormat>(spaceId: number, format: T, options?: SpaceReportFormatToOptionsMap[T]) {
  return axios.post<number>(`/api/spaces/${spaceId}/report`, { format, options }).then(res => res.data)
}

export async function fetchReports(spaceId: string) {
  return axios.get<ISpaceReport[]>(`/api/spaces/${spaceId}/report`).then(res => res.data)
}

export async function deleteReports(ids: number[]): Promise<number[]> {
  const query = new URLSearchParams(ids.map(s=>['id', String(s)]))

  return axios.delete<number[]>(`/api/spaces/report?${query.toString()}`).then(res => res.data)
}
