import axios from 'axios'
import { ISpaceReport, SpaceReportFormat, SpaceReportFormatToOptionsMap } from './space-report.types'

export async function createReport<T extends SpaceReportFormat>(scope: string, format: T, options?: SpaceReportFormatToOptionsMap[T]) {
  return axios.post<number>('/api/reports', { scope, format, options }).then(res => res.data)
}

export async function fetchReports(scope: string) {
  return axios.get<ISpaceReport[]>('/api/reports', { params: { scope }}).then(res => res.data)
}

export async function deleteReports(ids: number[]): Promise<number[]> {
  const query = new URLSearchParams(ids.map(s => ['id', String(s)]))

  return axios.delete<number[]>(`/api/reports?${query.toString()}`).then(res => res.data)
}
