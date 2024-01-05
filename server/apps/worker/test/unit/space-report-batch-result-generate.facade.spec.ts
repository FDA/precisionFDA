import { SqlEntityManager } from '@mikro-orm/mysql'
import { app, job, queue, userFile, workflow } from '@shared'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserCtx } from '@shared/types'
import { expect } from 'chai'
import { restore, SinonStub, stub } from 'sinon'
import { SpaceReportBatchResultGenerateFacade } from '../../src/facade/space-report/space-report-batch-result-generate.facade'

describe('SpaceReportBatchResultGenerateFacade', () => {
  const REPORT_ID = 0

  const APP_1_ID = 10
  const APP_1 = { id: APP_1_ID }

  const APP_2_ID = 20
  const APP_2 = { id: APP_2_ID }

  const APPS = [APP_1, APP_2]

  const WORKFLOW_1_ID = 30
  const WORKFLOW_1 = { id: WORKFLOW_1_ID }

  const PART_1_ID = 100
  const PART_1_TYPE = 'app'
  const PART_1 = {
    id: PART_1_ID,
    sourceType: PART_1_TYPE,
    sourceId: APP_1_ID,
    spaceReport: { id: REPORT_ID },
  }
  const PART_1_PROVENANCE_SVG = 'part 1 provenance svg'
  const PART_1_META_TITLE = 'part 1 meta title'
  const PART_1_META_CREATED = 'part 1 meta created'
  const PART_1_META = { title: PART_1_META_TITLE, created: PART_1_META_CREATED }

  const PART_2_ID = 200
  const PART_2_TYPE = 'app'
  const PART_2 = {
    id: PART_2_ID,
    sourceType: PART_2_TYPE,
    sourceId: APP_2_ID,
    spaceReport: { id: REPORT_ID },
  }
  const PART_2_PROVENANCE_SVG = 'part 2 provenance svg'
  const PART_2_META_TITLE = 'part 2 meta title'
  const PART_2_META_CREATED = 'part 2 meta created'
  const PART_2_META = { title: PART_2_META_TITLE, created: PART_2_META_CREATED }

  const PART_3_ID = 300
  const PART_3_TYPE = 'workflow'
  const PART_3 = {
    id: PART_3_ID,
    sourceType: PART_3_TYPE,
    sourceId: WORKFLOW_1_ID,
    spaceReport: { id: REPORT_ID },
  }
  const PART_3_PROVENANCE_SVG = 'part 3 provenance svg'
  const PART_3_META_TITLE = 'part 3 meta title'
  const PART_3_META_CREATED = 'part 3 meta created'
  const PART_3_META = { title: PART_3_META_TITLE, created: PART_3_META_CREATED }

  const PARTS = [PART_1, PART_2, PART_3]
  const PART_IDS = [PART_1_ID, PART_2_ID, PART_3_ID]

  const USER_ID = 1000
  const USER_CTX = { id: USER_ID } as unknown as UserCtx

  const transactionalStub = stub()
  const findStub = stub()
  const removeStub = stub()
  const getRepositoryStub = stub()

  const appFindStub = stub()
  const jobFindStub = stub()
  const workflowFindStub = stub()
  const assetFindStub = stub()
  const fileFindStub = stub()

  const hasAllBatchesDoneStub = stub()
  const completePartsBatchStub = stub()
  const getSpaceReportPartMetaDataStub = stub()

  const getEntityProvenanceStub = stub()

  let createGenerateSpaceReportResultTaskStub: SinonStub
  before(() => {
    createGenerateSpaceReportResultTaskStub = stub(queue, 'createGenerateSpaceReportResultTask')
  })

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.callsArg(0)

    findStub.reset()
    findStub.throws()
    findStub.withArgs(SpaceReportPart, PART_IDS).resolves(PARTS)

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

    getRepositoryStub.reset()
    getRepositoryStub.throws()
    getRepositoryStub.withArgs(app.App).returns({ find: appFindStub })
    getRepositoryStub.withArgs(job.Job).returns({ find: jobFindStub })
    getRepositoryStub.withArgs(workflow.Workflow).returns({ find: workflowFindStub })
    getRepositoryStub.withArgs(userFile.Asset).returns({ find: assetFindStub })
    getRepositoryStub.withArgs(userFile.UserFile).returns({ find: fileFindStub })

    hasAllBatchesDoneStub.reset()
    hasAllBatchesDoneStub.throws()
    hasAllBatchesDoneStub.withArgs(REPORT_ID).resolves(true)

    completePartsBatchStub.reset()
    completePartsBatchStub.throws()
    completePartsBatchStub
      .withArgs([
        {
          id: PART_1_ID,
          result: {
            title: PART_1_META_TITLE,
            created: PART_1_META_CREATED,
            svg: PART_1_PROVENANCE_SVG,
          },
        },
        {
          id: PART_2_ID,
          result: {
            title: PART_2_META_TITLE,
            created: PART_2_META_CREATED,
            svg: PART_2_PROVENANCE_SVG,
          },
        },
        {
          id: PART_3_ID,
          result: {
            title: PART_3_META_TITLE,
            created: PART_3_META_CREATED,
            svg: PART_3_PROVENANCE_SVG,
          },
        },
      ])
      .resolves()

    getSpaceReportPartMetaDataStub.reset()
    getSpaceReportPartMetaDataStub.throws()
    getSpaceReportPartMetaDataStub
      .withArgs({
        type: PART_1_TYPE,
        entity: APP_1,
      })
      .returns(PART_1_META)
    getSpaceReportPartMetaDataStub
      .withArgs({
        type: PART_2_TYPE,
        entity: APP_2,
      })
      .returns(PART_2_META)
    getSpaceReportPartMetaDataStub
      .withArgs({
        type: PART_3_TYPE,
        entity: WORKFLOW_1,
      })
      .returns(PART_3_META)

    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: PART_1_TYPE,
          entity: APP_1,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PART_1_PROVENANCE_SVG)
    getEntityProvenanceStub
      .withArgs(
        {
          type: PART_2_TYPE,
          entity: APP_2,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PART_2_PROVENANCE_SVG)
    getEntityProvenanceStub
      .withArgs(
        {
          type: PART_3_TYPE,
          entity: WORKFLOW_1,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PART_3_PROVENANCE_SVG)

    createGenerateSpaceReportResultTaskStub.reset()
    createGenerateSpaceReportResultTaskStub.throws()
    createGenerateSpaceReportResultTaskStub.withArgs(REPORT_ID, USER_CTX).resolves()
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
  it('should not catch an error from getSpaceReportPartMetaData', async () => {
    const error = new Error('my error')
    getSpaceReportPartMetaDataStub.reset()
    getSpaceReportPartMetaDataStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from getEntityProvenance', async () => {
    const error = new Error('my error')
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
  })

  it('should not catch an error from createGenerateSpaceReportResultTask', async () => {
    const error = new Error('my error')
    createGenerateSpaceReportResultTaskStub.reset()
    createGenerateSpaceReportResultTaskStub.throws(error)

    await expect(getInstance().generate(PART_IDS)).to.be.rejectedWith(error)
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
          result: {
            title: PART_3_META_TITLE,
            created: PART_3_META_CREATED,
            svg: PART_3_PROVENANCE_SVG,
          },
        },
      ])
      .resolves()

    await getInstance().generate(PART_IDS)

    expect(removeStub.calledOnce).to.be.true()
  })

  it('should not create space report result task if pending parts', async () => {
    hasAllBatchesDoneStub.withArgs(REPORT_ID).resolves(false)

    await getInstance().generate(PART_IDS)

    expect(createGenerateSpaceReportResultTaskStub.called).to.be.false()
  })

  it('should create space report result task if no pending parts', async () => {
    await getInstance().generate(PART_IDS)

    expect(createGenerateSpaceReportResultTaskStub.calledOnce).to.be.true()
  })

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      find: findStub,
      remove: removeStub,
      getRepository: getRepositoryStub,
    } as unknown as SqlEntityManager

    const spaceReportService = {
      hasAllBatchesDone: hasAllBatchesDoneStub,
      completePartsBatch: completePartsBatchStub,
      getSpaceReportPartMetaData: getSpaceReportPartMetaDataStub,
    } as unknown as SpaceReportService

    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportBatchResultGenerateFacade(
      em,
      USER_CTX,
      spaceReportService,
      entityProvenanceService,
    )
  }
})
