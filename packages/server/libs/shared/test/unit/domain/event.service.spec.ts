import { expect } from 'chai'
import { stub } from 'sinon'
import { ActivityReportService } from '@shared/domain/event/activity-report.service'
import { EventService } from '@shared/domain/event/event.service'

describe('EventService', () => {
  const getTotalsStub = stub()
  const getJobRunStub = stub()

  const activityReportService = {
    getTotals: getTotalsStub,
    getUserViewed: stub(),
    getUserAccessRequested: stub(),
    getUserLoggedIn: stub(),
    getDataUpload: stub(),
    getDataDownload: stub(),
    getDataGenerated: stub(),
    getAppCreated: stub(),
    getAppPublished: stub(),
    getAppRun: stub(),
    getJobRun: getJobRunStub,
    getJobFailed: stub(),
    getSubmissionsCreated: stub(),
    getUsersSignedUpForChallenge: stub(),
  } as unknown as ActivityReportService

  beforeEach(() => {
    getTotalsStub.reset()
    getJobRunStub.reset()
  })

  function getInstance(): EventService {
    return new EventService(activityReportService)
  }

  it('proxies totals query to ActivityReportService', async () => {
    const expected = {
      apps: 1,
      publicApps: 2,
      runtime: 3,
      dataStorage: 4,
      numberOfFiles: 5,
    }
    getTotalsStub.resolves(expected)

    const service = getInstance()
    const result = await service.getTotals()

    expect(result).to.deep.equal(expected)
    expect(getTotalsStub.calledOnce).to.be.true()
  })
})
