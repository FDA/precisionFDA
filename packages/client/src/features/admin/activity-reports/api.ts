import axios from 'axios'
import type { ActivityTotals, MetricResult } from './activity-reports.types'

const BASE_URL = '/api/v2/admin/activity-reports'
export const ACTIVITY_REPORT_STALE_TIME_MS = 60_000
export const ACTIVITY_REPORT_GC_TIME_MS = 5 * 60_000
export const ACTIVITY_METRIC_TYPES = [
  'userViewed',
  'userAccessRequested',
  'userLoggedIn',
  'dataUpload',
  'dataDownload',
  'dataGenerated',
  'appCreated',
  'appPublished',
  'appRun',
  'jobRun',
  'jobFailed',
  'submissionsCreated',
  'usersSignedUpForChallenge',
] as const

export type ActivityMetricType = (typeof ACTIVITY_METRIC_TYPES)[number]

export async function fetchActivityTotals(dateFrom: string, dateTo: string): Promise<ActivityTotals> {
  return axios.get(`${BASE_URL}/totals`, { params: { dateFrom, dateTo } }).then(r => r.data)
}

export async function fetchMetric(
  metricType: ActivityMetricType,
  dateFrom: string,
  dateTo: string,
): Promise<MetricResult> {
  return axios.get(`${BASE_URL}/metrics/${metricType}`, { params: { dateFrom, dateTo } }).then(r => r.data)
}
