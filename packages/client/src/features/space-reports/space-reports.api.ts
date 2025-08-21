import axios from 'axios'
import { ISpaceReport, SpaceReportFormat, SpaceReportFormatToOptionsMap } from './space-report.types'

export async function createReport<T extends SpaceReportFormat>(
  scope: string,
  format: T,
  options?: SpaceReportFormatToOptionsMap[T],
) {
  return axios.post<number>('/api/v2/reports', { scope, format, options }).then(res => res.data)
}

export async function fetchReports(scope: string) {
  return axios.get<ISpaceReport[]>('/api/v2/reports', { params: { scope }}).then(res => res.data)
}

export async function deleteReports(ids: number[]): Promise<number[]> {
  const query = new URLSearchParams(ids.map(s => ['id', String(s)]))
  return axios.delete<number[]>(`/api/v2/reports?${query.toString()}`).then(res => res.data)
}
