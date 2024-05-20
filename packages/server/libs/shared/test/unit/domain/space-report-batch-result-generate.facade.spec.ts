import { SqlEntityManager } from '@mikro-orm/mysql'
import { App } from '@shared/domain/app/app.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportQueueJobProducer } from '@shared/domain/space-report/producer/space-report-queue-job.producer'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { Space } from '@shared/domain/space/space.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { SpaceReportPartResultProvider } from '@shared/facade/space-report/service/space-report-part-result.provider'
import { SpaceReportBatchResultGenerateFacade } from '@shared/facade/space-report/space-report-batch-result-generate.facade'
import { UserCtx } from '@shared/types'
import { expect } from 'chai'
import { restore, stub } from 'sinon'

describe('SpaceReportBatchResultGenerateFacade', () => {
  const SPACE_ID = 1000
  const SPACE = { id: SPACE_ID }

  const REPORT_ID = 0
  const REPORT_SCOPE = `space-${SPACE_ID}`
  const REPORT = { id: REPORT_ID, scope: REPORT_SCOPE }

  const APP_1_ID = 10
  const APP_1 = { id: APP_1_ID }
  const APP_1_RESULT = 'APP_1_RESULT'

  const APP_2_ID = 20
  const APP_2 = { id: APP_2_ID }
  const APP_2_RESULT = 'APP_2_RESULT'

  const APPS = [APP_1, APP_2]

  const WORKFLOW_1_ID = 30
  const WORKFLOW_1 = { id: WORKFLOW_1_ID }
  const WORKFLOW_1_RESULT = 'WORKFLOW_1_RESULT'

  const PART_1_ID = 100
  const PART_1_TYPE = 'app'
  const PART_1 = {
    id: PART_1_ID,
    sourceType: PART_1_TYPE,
    sourceId: APP_1_ID,
    spaceReport: { id: REPORT_ID, getEntity: () => REPORT },
  }

  const PART_2_ID = 200
  const PART_2_TYPE = 'app'
  const PART_2 = {
    id: PART_2_ID,
    sourceType: PART_2_TYPE,
    sourceId: APP_2_ID,
    spaceReport: { id: REPORT_ID, getEntity: () => REPORT },
  }

  const PART_3_ID = 300
  const PART_3_TYPE = 'workflow'
  const PART_3 = {
    id: PART_3_ID,
    sourceType: PART_3_TYPE,
    sourceId: WORKFLOW_1_ID,
    spaceReport: { id: REPORT_ID, getEntity: () => REPORT },
  }

  const PARTS = [PART_1, PART_2, PART_3]
  const PART_IDS = [PART_1_ID, PART_2_ID, PART_3_ID]

  const USER_ID = 1000
  const USER_CTX = { id: USER_ID } as unknown as UserCtx

  const transactionalStub = stub()
  const findStub = stub()
  const findOneOrFailStub = stub()
  const removeStub = stub()
  const getRepositoryStub = stub()

  const appFindStub = stub()
  const jobFindStub = stub()
  const workflowFindStub = stub()
  const assetFindStub = stub()
  const fileFindStub = stub()
  const userFindStub = stub()
  const discussionFindStub = stub()

  const hasAllBatchesDoneStub = stub()
  const completePartsBatchStub = stub()

  const appGetResultStub = stub()
  const assetGetResultStub = stub()
  const fileGetResultStub = stub()
  const jobGetResultStub = stub()
  const workflowGetResultStub = stub()
  const userGetResultStub = stub()
  const discussionGetResultStub = stub()

  const createResultTaskStub = stub()

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.callsArg(0)

    findStub.reset()
    findStub.throws()
    findStub.withArgs(SpaceReportPart, PART_IDS).resolves(PARTS)

    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(SpaceReport, REPORT_ID).resolves(REPORT)
    findOneOrFailStub.withArgs(Space, SPACE_ID, { populate: ['spaceMemberships'] }).resolves(SPACE)

    removeStub.reset()
    removeStub.throws()

    appFindStub.reset()
    appFindStub.throws()
    appFindStub.withArgs([APP_1_ID, APP_2_ID]).resolves(APPS)

    jobFindStub.reset()
    jobFindStub.throws()

    workflowFindStub.reset()
    workflowFindStub.throws()
    workflowFindStub.withArgs([WORKFLOW_1_ID]).resolves([WORKFLOW_1])

    assetFindStub.reset()
    assetFindStub.throws()

    fileFindStub.reset()
    fileFindStub.throws()

    userFindStub.reset()
    userFindStub.throws()

    discussionFindStub.reset()
    discussionFindStub.throws()

    getRepositoryStub.reset()
    getRepositoryStub.throws()
    getRepositoryStub.withArgs(App).returns({ find: appFindStub })
    getRepositoryStub.withArgs(Job).returns({ find: jobFindStub })
    getRepositoryStub.withArgs(Workflow).returns({ find: workflowFindStub })
    getRepositoryStub.withArgs(Asset).returns({ find: assetFindStub })
    getRepositoryStub.withArgs(UserFile).returns({ find: fileFindStub })
    getRepositoryStub.withArgs(User).returns({ find: userFindStub })
    getRepositoryStub.withArgs(Discussion).returns({ find: discussionFindStub })

    hasAllBatchesDoneStub.reset()
    hasAllBatchesDoneStub.throws()
    hasAllBatchesDoneStub.withArgs(REPORT_ID).resolves(true)

    completePartsBatchStub.reset()
    completePartsBatchStub.throws()
    completePartsBatchStub
      .withArgs([
        {
          id: PART_1_ID,
          result: APP_1_RESULT,
        },
        {
          id: PART_2_ID,
          result: APP_2_RESULT,
        },
        {
          id: PART_3_ID,
          result: WORKFLOW_1_RESULT,
        },
      ])
      .resolves()

    appGetResultStub.reset()
    appGetResultStub.throws()
    appGetResultStub.withArgs(APP_1).resolves(APP_1_RESULT)
    appGetResultStub.withArgs(APP_2).resolves(APP_2_RESULT)

    assetGetResultStub.reset()
    assetGetResultStub.throws()

    fileGetResultStub.reset()
    fileGetResultStub.throws()

    jobGetResultStub.reset()
    jobGetResultStub.throws()

    workflowGetResultStub.reset()
    workflowGetResultStub.throws()
    workflowGetResultStub.withArgs(WORKFLOW_1).resolves(WORKFLOW_1_RESULT)

    userGetResultStub.reset()
    userGetResultStub.throws()

    discussionGetResultStub.reset()
    discussionGetResultStub.throws()

    createResultTaskStub.reset()
    createResultTaskStub.throws()
    createResultTaskStub.withArgs(REPORT_ID, USER_CTX).resolves()
  })

  after(() => {
    restore()
  })

  it('should run under transaction', async () => {
    await getInstance().generate(PART_IDS)

    expect(transactionalStub.calledOnce).to.be.true()
  })

  it('should not catch an error from transactional', async () => {
    const error = new Error('my error')
    transactionalStub.reset()
    transactionalStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from find', async () => {
    const error = new Error('my error')
    findStub.reset()
    findStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should create the instance if getRepository throws an error', async () => {
    const error = new Error('my error')
    getRepositoryStub.reset()
    getRepositoryStub.throws(error)

    expect(() => getInstance()).to.throw(error)
  })

  it('should not catch an error from appFind', async () => {
    const error = new Error('my error')
    appFindStub.reset()
    appFindStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from workflowFind', async () => {
    const error = new Error('my error')
    workflowFindStub.reset()
    workflowFindStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from hasPendingBatch', async () => {
    const error = new Error('my error')
    hasAllBatchesDoneStub.reset()
    hasAllBatchesDoneStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from completePartsBatch', async () => {
    const error = new Error('my error')
    completePartsBatchStub.reset()
    completePartsBatchStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from createGenerateSpaceReportResultTask', async () => {
    const error = new Error('my error')
    createResultTaskStub.reset()
    createResultTaskStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch error from meta provider', async () => {
    const error = new Error('my error')

    findStub.reset()
    findStub.throws()
    findStub.withArgs(SpaceReportPart, [PART_1_ID, PART_2_ID]).resolves([PART_1, PART_2])

    appGetResultStub.reset()
    appGetResultStub.throws(error)

    await expect(getInstance().generate([PART_1_ID, PART_2_ID])).to.be.rejectedWith(error)
  })
  ;[
    { type: 'app', repoFindStub: appFindStub, resultStub: appGetResultStub },
    { type: 'asset', repoFindStub: assetFindStub, resultStub: assetGetResultStub },
    { type: 'file', repoFindStub: fileFindStub, resultStub: fileGetResultStub },
    { type: 'job', repoFindStub: jobFindStub, resultStub: jobGetResultStub },
    { type: 'workflow', repoFindStub: workflowFindStub, resultStub: workflowGetResultStub },
    { type: 'user', repoFindStub: userFindStub, resultStub: userGetResultStub },
    { type: 'discussion', repoFindStub: discussionFindStub, resultStub: discussionGetResultStub },
  ].forEach((prop) => {
    it(`should use the correct result meta provider and repo for source type ${prop.type}`, async () => {
      const ENTITY_ID = 1
      const ENTITY = { id: ENTITY_ID }

      const REPORT_PART_ID = 10
      const REPORT_PART = {
        sourceType: prop.type,
        sourceId: ENTITY_ID,
        id: REPORT_PART_ID,
        spaceReport: { id: REPORT_ID, getEntity: () => REPORT },
      }

      const RESULT = 'RESULT'

      findStub.reset()
      findStub.throws()
      findStub.withArgs(SpaceReportPart, [REPORT_PART_ID]).resolves([REPORT_PART])

      prop.repoFindStub.reset()
      prop.repoFindStub.throws()
      prop.repoFindStub.withArgs([ENTITY_ID]).resolves([ENTITY])

      prop.resultStub.withArgs(ENTITY).resolves(RESULT)

      completePartsBatchStub.reset()
      completePartsBatchStub.throws()
      completePartsBatchStub.withArgs([{ id: REPORT_PART_ID, result: RESULT }]).resolves()

      await getInstance().generate([REPORT_PART_ID])

      expect(completePartsBatchStub.calledOnce).to.be.true()
    })
  })

  it('should throw an error while instantiating if getRepository throws an error', async () => {
    const error = new Error('my error')
    getRepositoryStub.reset()
    getRepositoryStub.throws(error)

    expect(() => getInstance()).to.throw(error)
  })

  it('should remove parts with missing sources and complete the rest', async () => {
    appFindStub.withArgs([APP_1_ID, APP_2_ID]).resolves([])

    removeStub.withArgs([PART_1, PART_2]).returns(null)

    completePartsBatchStub.reset()
    completePartsBatchStub.throws()
    completePartsBatchStub
      .withArgs([
        {
          id: PART_3_ID,
          result: WORKFLOW_1_RESULT,
        },
      ])
      .resolves()

    await getInstance().generate(PART_IDS)

    expect(removeStub.calledOnce).to.be.true()
  })

  it('should not create space report result task if pending parts', async () => {
    hasAllBatchesDoneStub.withArgs(REPORT_ID).resolves(false)

    await getInstance().generate(PART_IDS)

    expect(createResultTaskStub.called).to.be.false()
  })

  it('should create space report result task if no pending parts', async () => {
    await getInstance().generate(PART_IDS)

    expect(createResultTaskStub.calledOnce).to.be.true()
  })

  it('should create space report result task for private', async () => {
    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(SpaceReport, REPORT_ID).resolves(REPORT)

    findStub.reset()
    findStub.throws()
    findStub.withArgs(SpaceReportPart, [11]).resolves([
      {
        id: PART_1_ID,
        sourceType: PART_1_TYPE,
        sourceId: APP_1_ID,
        spaceReport: { id: REPORT_ID, getEntity: () => ({ id: REPORT_ID, scope: 'private' }) },
      },
    ])

    appGetResultStub.reset()
    appGetResultStub.throws()
    appGetResultStub.withArgs(APP_1).resolves(APP_1_RESULT)

    workflowGetResultStub.reset()
    workflowGetResultStub.throws()

    appFindStub.reset()
    appFindStub.throws()
    appFindStub.withArgs([APP_1_ID]).resolves([APP_1])

    workflowFindStub.reset()
    workflowFindStub.throws()

    completePartsBatchStub.reset()
    completePartsBatchStub.throws()
    completePartsBatchStub
      .withArgs([
        {
          id: PART_1_ID,
          result: APP_1_RESULT,
        },
      ])
      .resolves()

    await getInstance().generate([11])

    expect(createResultTaskStub.calledOnce).to.be.true()
  })

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      find: findStub,
      remove: removeStub,
      getRepository: getRepositoryStub,
      findOneOrFail: findOneOrFailStub,
    } as unknown as SqlEntityManager

    const spaceReportService = {
      hasAllBatchesDone: hasAllBatchesDoneStub,
      completePartsBatch: completePartsBatchStub,
    } as unknown as SpaceReportService

    const SOURCE_TYPE_TO_RESULT_PROVIDER: {
      [T in SpaceReportPartSourceType]: SpaceReportPartResultProvider<T>
    } = {
      app: {
        getResult: appGetResultStub,
      },
      asset: {
        getResult: assetGetResultStub,
      },
      file: {
        getResult: fileGetResultStub,
      },
      job: {
        getResult: jobGetResultStub,
      },
      workflow: {
        getResult: workflowGetResultStub,
      },
      user: {
        getResult: userGetResultStub,
      },
      discussion: {
        getResult: discussionGetResultStub,
      },
    }

    const spaceReportQueueJobProducer = {
      createResultTask: createResultTaskStub,
    } as unknown as SpaceReportQueueJobProducer

    return new SpaceReportBatchResultGenerateFacade(
      em,
      USER_CTX,
      spaceReportService,
      spaceReportQueueJobProducer,
      SOURCE_TYPE_TO_RESULT_PROVIDER,
    )
  }
})
