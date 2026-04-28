import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { TimeUtils } from '@shared/utils/time.utils'
import { EVENT_TYPES } from './event.entity'
import { ActivityTotals } from './model/activity-totals'
import { GroupingType } from './model/grouping.type'
import { MetricType } from './model/metric.type'
import { MetricDataRow } from './model/metric-data-row'
import { MetricDefinition } from './model/metric-definition'
import { MetricResult } from './model/metric-result'
import { MetricTotalRow } from './model/metric-total-row'
import { TotalsRow } from './model/totals-row'

@Injectable()
export class ActivityReportService {
  private readonly THREE_MONTHS_SECONDS = TimeUtils.daysToSeconds(30 * 3)
  private readonly FORTY_EIGHT_HOURS_SECONDS = TimeUtils.hoursToSeconds(48)

  private readonly METRIC_DEFINITIONS: Record<MetricType, MetricDefinition> = {
    userViewed: {
      eventType: EVENT_TYPES.USER_VIEWED,
      aggregate: 'countDistinct',
      column: 'dxuser',
    },
    userAccessRequested: {
      eventType: EVENT_TYPES.USER_ACCESS_REQUESTED,
      aggregate: 'count',
      column: 'id',
    },
    userLoggedIn: {
      eventType: EVENT_TYPES.USER_LOGGED_IN,
      aggregate: 'count',
      column: 'id',
    },
    dataUpload: {
      eventType: EVENT_TYPES.FILE_CREATED,
      aggregate: 'sum',
      column: 'param1',
      filters: { param3: 'User' },
    },
    dataDownload: {
      eventType: EVENT_TYPES.FILE_DOWNLOADED,
      aggregate: 'sum',
      column: 'param1',
    },
    dataGenerated: {
      eventType: EVENT_TYPES.FILE_CREATED,
      aggregate: 'sum',
      column: 'param1',
      filters: { param3: 'Job' },
    },
    appCreated: {
      eventType: EVENT_TYPES.APP_CREATED,
      aggregate: 'count',
      column: 'id',
    },
    appPublished: {
      eventType: EVENT_TYPES.APP_PUBLISHED,
      aggregate: 'count',
      column: 'id',
    },
    appRun: {
      eventType: EVENT_TYPES.JOB_RUN,
      aggregate: 'countDistinct',
      column: 'param2',
    },
    jobRun: {
      eventType: EVENT_TYPES.JOB_RUN,
      aggregate: 'count',
      column: 'id',
    },
    jobFailed: {
      eventType: EVENT_TYPES.JOB_CLOSED,
      aggregate: 'count',
      column: 'id',
      filters: { param4: 'failed' },
    },
    submissionsCreated: {
      eventType: EVENT_TYPES.SUBMISSION_CREATED,
      aggregate: 'count',
      column: 'id',
    },
    usersSignedUpForChallenge: {
      eventType: EVENT_TYPES.SIGNED_UP_FOR_CHALLENGE,
      aggregate: 'count',
      column: 'id',
    },
  }

  constructor(private readonly em: EntityManager) {}

  async getTotals(startDate?: Date, endDate?: Date): Promise<ActivityTotals> {
    const conn = this.em.getConnection()

    const dateFilter = startDate != null && endDate != null ? ' AND created_at BETWEEN ? AND ?' : ''
    const dateParams = startDate != null && endDate != null ? [startDate, endDate] : []

    const rows = await conn.execute<TotalsRow[]>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN type = ? THEN 1 ELSE 0 END), 0) AS apps,
          COALESCE(SUM(CASE WHEN type = ? THEN 1 ELSE 0 END), 0) AS public_apps,
          COALESCE(SUM(CASE WHEN type = ? THEN COALESCE(CAST(param2 AS UNSIGNED), 0) ELSE 0 END), 0) AS runtime,
          COALESCE(SUM(CASE WHEN type = ? THEN COALESCE(CAST(param1 AS UNSIGNED), 0) ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type = ? THEN COALESCE(CAST(param1 AS UNSIGNED), 0) ELSE 0 END), 0) AS data_storage,
          COALESCE(SUM(CASE WHEN type = ? THEN 1 ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type = ? THEN 1 ELSE 0 END), 0) AS number_of_files
        FROM events
        WHERE type IN (?, ?, ?, ?, ?)${dateFilter}
      `,
      [
        EVENT_TYPES.APP_CREATED,
        EVENT_TYPES.APP_PUBLISHED,
        EVENT_TYPES.JOB_CLOSED,
        EVENT_TYPES.FILE_CREATED,
        EVENT_TYPES.FILE_DELETED,
        EVENT_TYPES.FILE_CREATED,
        EVENT_TYPES.FILE_DELETED,
        EVENT_TYPES.APP_CREATED,
        EVENT_TYPES.APP_PUBLISHED,
        EVENT_TYPES.JOB_CLOSED,
        EVENT_TYPES.FILE_CREATED,
        EVENT_TYPES.FILE_DELETED,
        ...dateParams,
      ],
    )

    const row = rows[0]

    return {
      apps: Number(row?.apps ?? 0),
      publicApps: Number(row?.public_apps ?? 0),
      runtime: Number(row?.runtime ?? 0),
      dataStorage: Number(row?.data_storage ?? 0),
      numberOfFiles: Number(row?.number_of_files ?? 0),
    }
  }

  async getMetric(metricType: MetricType, startDate: Date, endDate: Date): Promise<MetricResult> {
    const definition = this.METRIC_DEFINITIONS[metricType]
    const conn = this.em.getConnection()
    const grouping = this.getGroupingType(startDate, endDate)
    const bucketExpr = this.getBucketExpression(grouping)
    const aggregation = this.buildAggregation(definition)
    const { whereClause, params } = this.buildWhereClause(definition, startDate, endDate)

    const [totalRows, dataRows] = await Promise.all([
      conn.execute<MetricTotalRow[]>(
        `SELECT COALESCE(${aggregation}, 0) as total FROM events WHERE ${whereClause}`,
        params,
      ),
      conn.execute<MetricDataRow[]>(
        `SELECT COALESCE(${aggregation}, 0) as value, ${bucketExpr} as bucket FROM events WHERE ${whereClause} GROUP BY bucket ORDER BY bucket`,
        params,
      ),
    ])

    const total = Number(totalRows[0]?.total ?? 0)
    const dataMap = new Map<number, number>()
    for (const row of dataRows) {
      const timestamp = this.bucketToTimestamp(row.bucket, grouping)
      dataMap.set(timestamp, Number(row.value ?? 0))
    }

    const bucketTimestamps = this.getBucketTimestamps(startDate, endDate, grouping)
    const data: [number, number][] = bucketTimestamps.map(ts => [ts, dataMap.get(ts) ?? 0])

    return { total, data }
  }

  private buildAggregation(definition: MetricDefinition): string {
    if (definition.aggregate === 'count') {
      return `COUNT(${definition.column})`
    }

    if (definition.aggregate === 'countDistinct') {
      return `COUNT(DISTINCT ${definition.column})`
    }

    return `CAST(SUM(${definition.column}) AS UNSIGNED)`
  }

  private buildWhereClause(
    definition: MetricDefinition,
    startDate: Date,
    endDate: Date,
  ): { whereClause: string; params: unknown[] } {
    let whereClause = 'type = ? AND created_at BETWEEN ? AND ?'
    const params: unknown[] = [definition.eventType, startDate, endDate]

    if (!definition.filters) {
      return { whereClause, params }
    }

    for (const [column, value] of Object.entries(definition.filters)) {
      whereClause += ` AND ${column} = ?`
      params.push(value)
    }

    return { whereClause, params }
  }

  private getGroupingType(startDate: Date, endDate: Date): GroupingType {
    const diffSeconds = (endDate.getTime() - startDate.getTime()) / 1000
    if (diffSeconds >= this.THREE_MONTHS_SECONDS) return 'month'
    if (diffSeconds <= this.FORTY_EIGHT_HOURS_SECONDS) return 'hour'
    return 'day'
  }

  private getBucketExpression(grouping: GroupingType): string {
    switch (grouping) {
      case 'hour':
        return "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')"
      case 'day':
        return "DATE_FORMAT(created_at, '%Y-%m-%d')"
      case 'month':
        return "DATE_FORMAT(created_at, '%Y-%m-01')"
    }
  }

  private bucketToTimestamp(bucket: string, grouping: GroupingType): number {
    switch (grouping) {
      case 'hour':
        return new Date(`${bucket}Z`).getTime()
      case 'day':
      case 'month':
        return new Date(`${bucket}T00:00:00Z`).getTime()
    }
  }

  private getBucketTimestamps(startDate: Date, endDate: Date, grouping: GroupingType): number[] {
    switch (grouping) {
      case 'hour':
        return this.buildBuckets(
          startDate,
          endDate,
          date => {
            const normalized = new Date(date)
            normalized.setUTCMinutes(0, 0, 0)
            return normalized
          },
          date => {
            date.setUTCHours(date.getUTCHours() + 1)
          },
        )
      case 'day':
        return this.buildBuckets(
          startDate,
          endDate,
          date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
          date => {
            date.setUTCDate(date.getUTCDate() + 1)
          },
        )
      case 'month':
        return this.buildBuckets(
          startDate,
          endDate,
          date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
          date => {
            date.setUTCMonth(date.getUTCMonth() + 1)
          },
        )
    }
  }

  private buildBuckets(
    startDate: Date,
    endDate: Date,
    normalize: (date: Date) => Date,
    advance: (date: Date) => void,
  ): number[] {
    const buckets: number[] = []
    const current = normalize(startDate)
    const end = normalize(endDate)

    while (current.getTime() <= end.getTime()) {
      buckets.push(current.getTime())
      advance(current)
    }

    return buckets
  }
}
