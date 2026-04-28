import { EntityManager } from '@mikro-orm/core'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ActivityReportService } from '@shared/domain/event/activity-report.service'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'

describe('ActivityReportService', () => {
  const executeStub = stub()

  const em = {
    getConnection: () => ({
      execute: executeStub,
    }),
  } as unknown as EntityManager

  beforeEach(() => {
    executeStub.reset()
  })

  function getInstance(): ActivityReportService {
    return new ActivityReportService(em)
  }

  it('computes totals from a single aggregate query', async () => {
    executeStub.resolves([
      {
        apps: '5',
        public_apps: '3',
        runtime: '120',
        data_storage: '80',
        number_of_files: '2',
      },
    ])

    const service = getInstance()
    const result = await service.getTotals()

    expect(executeStub.calledOnce).to.be.true()
    const [sql, params] = executeStub.firstCall.args as [string, unknown[]]
    expect(sql).to.contain('CASE WHEN type = ? THEN 1 ELSE 0 END')
    expect(sql).to.contain('AS apps')
    expect(sql).to.contain('AS data_storage')
    expect(sql).to.contain('WHERE type IN (?, ?, ?, ?, ?)')
    expect(params).to.deep.equal([
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
    ])
    expect(result).to.deep.equal({
      apps: 5,
      publicApps: 3,
      runtime: 120,
      dataStorage: 80,
      numberOfFiles: 2,
    })
  })

  it('scopes totals to created_at when a date range is provided', async () => {
    executeStub.resolves([
      {
        apps: '1',
        public_apps: '0',
        runtime: '10',
        data_storage: '20',
        number_of_files: '1',
      },
    ])

    const start = new Date('2026-01-01T00:00:00Z')
    const end = new Date('2026-01-31T23:59:59Z')
    const service = getInstance()
    await service.getTotals(start, end)

    expect(executeStub.calledOnce).to.be.true()
    const [sql, params] = executeStub.firstCall.args as [string, unknown[]]
    expect(sql).to.contain('created_at BETWEEN ? AND ?')
    expect(params[params.length - 2]).to.equal(start)
    expect(params[params.length - 1]).to.equal(end)
  })

  it('returns zero totals when aggregate row is missing', async () => {
    executeStub.resolves([])

    const service = getInstance()
    const result = await service.getTotals()

    expect(result).to.deep.equal({
      apps: 0,
      publicApps: 0,
      runtime: 0,
      dataStorage: 0,
      numberOfFiles: 0,
    })
  })
})
