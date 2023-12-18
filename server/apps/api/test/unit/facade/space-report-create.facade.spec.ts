import { queue, spaceReport, user as userDomain } from '@shared'
import { UserOpsCtx } from '@shared/dist/types'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { SpaceReportCreateFacade } from '../../../src/facade/space-report-create.facade'

describe('SpaceReportCreateFacade', () => {
  const USER_ID = 1
  const USER = 'user'
  const SPACE_ID = 2

  let createReportStub: SinonStub
  let getReferenceStub: SinonStub
  let createGenerateSpaceReportBatchTasksStub: SinonStub

  beforeEach(() => {
    getReferenceStub = stub().throws()
    createReportStub = stub().throws()
    createGenerateSpaceReportBatchTasksStub = stub(queue, 'createGenerateSpaceReportBatchTasks').resolves()

    getReferenceStub.withArgs(userDomain.User, USER_ID).returns(USER)
    setCreateReportStub([])
  })

  afterEach(() => {
    createGenerateSpaceReportBatchTasksStub.restore()
  })

  it('should not catch error from getReference', async () => {
    const error = new Error('my error')
    getReferenceStub = stub().throws(error)

    await expect(getInstance().createSpaceReport(SPACE_ID)).to.be.rejectedWith(error)
  })

  it('should not catch error from createReport', async () => {
    const error = new Error('my error')
    createReportStub = stub().throws(error)

    await expect(getInstance().createSpaceReport(SPACE_ID)).to.be.rejectedWith(error)
  })

  it('should not catch error from createGenerateSpaceReportBatchTasks', async () => {
    const error = new Error('my error')
    createGenerateSpaceReportBatchTasksStub.reset()
    createGenerateSpaceReportBatchTasksStub.throws(error)

    await expect(getInstance().createSpaceReport(SPACE_ID)).to.be.rejectedWith(error)
  })

  it('should call create report with correct args', async () => {
    await getInstance().createSpaceReport(SPACE_ID)

    expect(createReportStub.calledOnce).to.be.true()
  })

  it('should create task with 1 batch for 1 report part', async () => {
    setCreateReportStub([{ id: 1 }])
    createGenerateSpaceReportBatchTasksStub.reset()
    createGenerateSpaceReportBatchTasksStub.throws()
    createGenerateSpaceReportBatchTasksStub.withArgs([[1]]).returns(null)

    await getInstance().createSpaceReport(SPACE_ID)

    expect(createGenerateSpaceReportBatchTasksStub.calledOnce).to.be.true()
  })

  it('should create task with 1 batch for 3 report parts with batch size 3', async () => {
    setCreateReportStub([{ id: 1 }, { id: 2 }, { id: 3 }])
    createGenerateSpaceReportBatchTasksStub.reset()
    createGenerateSpaceReportBatchTasksStub.throws()
    createGenerateSpaceReportBatchTasksStub.withArgs([[1, 2, 3]]).returns(null)

    await getInstance().createSpaceReport(SPACE_ID)

    expect(createGenerateSpaceReportBatchTasksStub.calledOnce).to.be.true()
  })

  it('should create task with 3 batches for 8 report parts with batch size 3', async () => {
    setCreateReportStub([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }])
    createGenerateSpaceReportBatchTasksStub.reset()
    createGenerateSpaceReportBatchTasksStub.throws()
    createGenerateSpaceReportBatchTasksStub.withArgs([[1, 2, 3], [4, 5, 6], [7, 8]]).returns(null)

    await getInstance().createSpaceReport(SPACE_ID)

    expect(createGenerateSpaceReportBatchTasksStub.calledOnce).to.be.true()
  })

  function setCreateReportStub(reportParts: unknown[]) {
    createReportStub.withArgs(SPACE_ID, USER).resolves({
      reportParts: {
        getItems() {
          return reportParts
        },
      },
    })
  }

  function getInstance() {
    const em = { getReference: getReferenceStub }

    const ctx = {
      user: {
        id: USER_ID,
        accessToken: 'access-token',
        dxuser: 'dxuser',
      },
      log: null,
      em,
    } as unknown as UserOpsCtx

    const spaceReportService = { createReport: createReportStub } as unknown as spaceReport.SpaceReportService

    return new SpaceReportCreateFacade(ctx, spaceReportService)
  }
})
