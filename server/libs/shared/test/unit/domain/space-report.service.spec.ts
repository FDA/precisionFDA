import { QueryOrder, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { errors } from '@shared'
import { expect } from 'chai'
import { restore, stub } from 'sinon'
import { App, Asset, Job, Space, SpaceReport, SpaceReportPart, User, UserFile, Workflow } from '../../../src/domain'
import { BatchComplete, SpaceReportPartSourceType, SpaceReportService } from '../../../src/domain/space-report'
import { SpaceReportPartSourceEntity } from '../../../src/domain/space-report/model/space-report-part-source-entity'
import { SpaceReportPartService } from '../../../src/domain/space-report/service/part/space-report-part.service'
import { SpaceReportResultService } from '../../../src/domain/space-report/service/space-report-result.service'

describe('SpaceReportService', () => {
  describe('#createReport', () => {
    const USER_ID = 0
    const USER = { id: USER_ID } as unknown as User

    const SPACE_ID = 10
    const SPACE_SCOPE = 'space scope'
    const SPACE = { id: SPACE_ID, scope: SPACE_SCOPE }

    const FILE_1_ID = 100
    const FILE_1 = { id: FILE_1_ID }

    const FILE_2_ID = 200
    const FILE_2 = { id: FILE_2_ID }

    const FILES = [FILE_1, FILE_2]

    const APP_ID = 1000
    const APP = { id: APP_ID }

    const PART_1 = new SpaceReportPart()
    const PART_2 = new SpaceReportPart()

    const PARTS = [PART_1, PART_2]

    const transactionalStub = stub()
    const createQueryBuilderStub = stub()
    const joinAndSelectedMembershipStub = stub()
    const joinAndSelectUserStub = stub()
    const whereStub = stub()
    const getResultStub = stub()
    const findStub = stub()
    const createPartsStub = stub()
    const persistStub = stub()

    before(() => {
      stub(Reference, 'create').withArgs(USER).returns(USER)
    })

    beforeEach(() => {
      transactionalStub.reset()
      transactionalStub.callsArg(0)

      getResultStub.reset()
      getResultStub.resolves([SPACE])

      whereStub.reset()
      whereStub.throws()
      whereStub.withArgs({ 'space.id': [SPACE_ID], 'user.id': USER_ID }).returns({ getResult: getResultStub })

      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws()
      joinAndSelectUserStub.withArgs('membership.user', 'user').returns({ where: whereStub })

      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws()
      joinAndSelectedMembershipStub.withArgs('space.spaceMemberships', 'membership').returns({ joinAndSelect: joinAndSelectUserStub })

      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws()
      createQueryBuilderStub.withArgs(Space, 'space').returns({ joinAndSelect: joinAndSelectedMembershipStub })

      findStub.reset()
      findStub.throws()
      findStub.withArgs(UserFile, { scope: SPACE_SCOPE }).resolves(FILES)
      findStub.withArgs(App, { scope: SPACE_SCOPE }).resolves([APP])
      findStub.withArgs(Job, { scope: SPACE_SCOPE }).resolves([])
      findStub.withArgs(Asset, { scope: SPACE_SCOPE }).resolves([])
      findStub.withArgs(Workflow, { scope: SPACE_SCOPE }).resolves([])

      createPartsStub.reset()
      createPartsStub.throws()
      createPartsStub
        .withArgs([
          { type: 'file', id: FILE_1_ID },
          { type: 'file', id: FILE_2_ID },
          { type: 'app', id: APP_ID },
        ])
        .resolves(PARTS)

      persistStub.reset()
    })

    after(() => {
      restore()
    })

    it('should reject if no space id provided', async () => {
      await expect(getInstance().createReport(null, USER)).to.be.rejectedWith(errors.InvalidStateError, 'Space id is required for creating a report')
    })

    it('should run under transaction', async () => {
      await getInstance().createReport(SPACE_ID, USER)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should reject if space not existing or not accessible', async () => {
      getResultStub.reset()
      getResultStub.resolves([])

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(errors.NotFoundError, 'Space not found')
    })

    it('should reject if no report parts', async () => {
      createPartsStub.reset()
      createPartsStub.resolves([])

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(errors.InvalidStateError, 'Report not generated: No entities to report on in this space')
    })

    it('should not catch error from queryBuilder', async () => {
      const error = new Error('my error')
      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectedMembership', async () => {
      const error = new Error('my error')
      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectUser', async () => {
      const error = new Error('my error')
      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from where', async () => {
      const error = new Error('my error')
      whereStub.reset()
      whereStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from getResult', async () => {
      const error = new Error('my error')
      getResultStub.reset()
      getResultStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from find', async () => {
      const error = new Error('my error')
      findStub.reset()
      findStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from createParts', async () => {
      const error = new Error('my error')
      createPartsStub.reset()
      createPartsStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from persist', async () => {
      const error = new Error('my error')
      persistStub.reset()
      persistStub.throws(error)

      await expect(getInstance().createReport(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should persist new space report', async () => {
      await getInstance().createReport(SPACE_ID, USER)

      expect(persistStub.calledOnce).to.be.true()

      const persistedReport = persistStub.getCall(0).args[0]
      assertReport(persistedReport)
    })

    it('should return new space report', async () => {
      const res = await getInstance().createReport(SPACE_ID, USER)

      assertReport(res)
    })

    function assertReport(report: SpaceReport) {
      expect(report.space).to.eq(SPACE)
      expect(report.state).to.eq('CREATED')
      expect(report.resultFile).to.be.undefined()
      expect(report.createdBy).to.eq(USER)

      const parts = report.reportParts.getItems()
      expect(parts).to.have.length(2)
      parts.forEach(assertReportPart)
    }

    function assertReportPart(part: SpaceReportPart) {
      expect(part.result).to.be.undefined()
      expect(part.state).to.eq('CREATED')
    }

    function getInstance() {
      const em = {
        transactional: transactionalStub,
        createQueryBuilder: createQueryBuilderStub,
        find: findStub,
        persist: persistStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {
        createReportParts: createPartsStub,
      } as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#getReports', () => {
    const REPORT_1_ID = 0
    const REPORT_1 = { id: REPORT_1_ID }

    const REPORT_2_ID = 0
    const REPORT_2 = { ID: REPORT_2_ID }

    const REPORT_IDS = [REPORT_1_ID, REPORT_2_ID]
    const REPORTS = [REPORT_1, REPORT_2]

    const findStub = stub()

    beforeEach(() => {
      findStub.reset()
      findStub.throws()
      findStub.withArgs(SpaceReport, REPORT_IDS).resolves(REPORTS)
    })

    it('should not catch error from find', async () => {
      const error = new Error('my error')
      findStub.reset()
      findStub.throws(error)

      await expect(getInstance().getReports(REPORT_IDS)).to.be.rejectedWith(error)
    })

    it('should return reports from EM', async () => {
      const res = await getInstance().getReports(REPORT_IDS)

      expect(res).to.be.eq(REPORTS)
    })

    function getInstance() {
      const em = {
        find: findStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#getReportsForSpace', () => {
    const USER_ID = 0
    const USER = { id: USER_ID } as unknown as User

    const SPACE_ID = 10
    const SPACE = { id: SPACE_ID }

    const REPORT_1_ID = 100
    const REPORT_1_CREATED = 'report 1 created'
    const REPORT_1_STATE = 'report 1 state'
    const REPORT_1_RESULT_FILE = 'report 1 resultFile'
    const REPORT_1 = { id: REPORT_1_ID, createdAt: REPORT_1_CREATED, state: REPORT_1_STATE, resultFile: REPORT_1_RESULT_FILE }

    const REPORT_2_ID = 200
    const REPORT_2_CREATED = 'report 2 created'
    const REPORT_2_STATE = 'report 2 state'
    const REPORT_2_RESULT_FILE = 'report 2 resultFile'
    const REPORT_2 = { id: REPORT_2_ID, createdAt: REPORT_2_CREATED, state: REPORT_2_STATE, resultFile: REPORT_2_RESULT_FILE }

    const REPORTS = [REPORT_1, REPORT_2]

    const transactionalStub = stub()
    const createQueryBuilderStub = stub()
    const joinAndSelectedMembershipStub = stub()
    const joinAndSelectUserStub = stub()
    const whereStub = stub()
    const getResultStub = stub()
    const findStub = stub()

    beforeEach(() => {
      transactionalStub.reset()
      transactionalStub.callsArg(0)

      getResultStub.reset()
      getResultStub.resolves([SPACE])

      whereStub.reset()
      whereStub.throws()
      whereStub.withArgs({ 'space.id': [SPACE_ID], 'user.id': USER_ID }).returns({ getResult: getResultStub })

      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws()
      joinAndSelectUserStub.withArgs('membership.user', 'user').returns({ where: whereStub })

      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws()
      joinAndSelectedMembershipStub.withArgs('space.spaceMemberships', 'membership').returns({ joinAndSelect: joinAndSelectUserStub })

      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws()
      createQueryBuilderStub.withArgs(Space, 'space').returns({ joinAndSelect: joinAndSelectedMembershipStub })

      findStub.reset()
      findStub.throws()
      findStub.withArgs(SpaceReport, { space: SPACE }, {
        orderBy: { createdAt: QueryOrder.desc },
        populate: ['resultFile'],
      }).resolves(REPORTS)
    })

    it('should run under transaction', async () => {
      await getInstance().getReportsForSpace(SPACE_ID, USER)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should reject if space not existing or not accessible', async () => {
      getResultStub.reset()
      getResultStub.resolves([])

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(errors.NotFoundError, 'Space not found')
    })

    it('should not catch error from queryBuilder', async () => {
      const error = new Error('my error')
      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectedMembership', async () => {
      const error = new Error('my error')
      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectUser', async () => {
      const error = new Error('my error')
      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from where', async () => {
      const error = new Error('my error')
      whereStub.reset()
      whereStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from getResult', async () => {
      const error = new Error('my error')
      getResultStub.reset()
      getResultStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from find', async () => {
      const error = new Error('my error')
      findStub.reset()
      findStub.throws(error)

      await expect(getInstance().getReportsForSpace(SPACE_ID, USER)).to.be.rejectedWith(error)
    })

    it('should return correct data', async () => {
      const res = await getInstance().getReportsForSpace(SPACE_ID, USER)

      expect(res).to.deep.eq([
        {
          id: REPORT_1_ID,
          createdAt: REPORT_1_CREATED,
          state: REPORT_1_STATE,
          resultFile: REPORT_1_RESULT_FILE,
        },
        {
          id: REPORT_2_ID,
          createdAt: REPORT_2_CREATED,
          state: REPORT_2_STATE,
          resultFile: REPORT_2_RESULT_FILE,
        },
      ])
    })

    function getInstance() {
      const em = {
        transactional: transactionalStub,
        createQueryBuilder: createQueryBuilderStub,
        find: findStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#deleteReports', () => {
    const REPORT_1_ID = 100
    const REPORT_1 = { id: REPORT_1_ID }

    const REPORT_2_ID = 200
    const REPORT_2 = { id: REPORT_2_ID }

    const REPORTS = [REPORT_1, REPORT_2] as unknown as SpaceReport[]

    const transactionalStub = stub()
    const removeStub = stub()

    beforeEach(() => {
      transactionalStub.reset()
      transactionalStub.callsArg(0)

      removeStub.reset()
    })

    it('should run under transaction', async () => {
      await getInstance().deleteReports(REPORTS)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().deleteReports(REPORTS)).to.be.rejectedWith(error)
    })

    it('should not catch error from remove', async () => {
      const error = new Error('my error')
      removeStub.reset()
      removeStub.throws(error)

      await expect(getInstance().deleteReports(REPORTS)).to.be.rejectedWith(error)
    })

    it('should not delete any reports when no reports provided', async () => {
      const res = await getInstance().deleteReports([])

      expect(removeStub.called).to.be.false()
      expect(res).to.be.empty()
    })

    it('should delete provided reports', async () => {
      await getInstance().deleteReports(REPORTS)

      expect(removeStub.calledOnce).to.be.true()

      const removedReports = removeStub.getCall(0).args[0]
      expect(removedReports).to.have.length(2)
      expect(removedReports).to.include(REPORT_1)
      expect(removedReports).to.include(REPORT_2)
    })

    it('should return ids of deleted reports reports', async () => {
      const res = await getInstance().deleteReports(REPORTS)

      expect(res).to.have.length(2)
      expect(res).to.include(REPORT_1_ID)
      expect(res).to.include(REPORT_2_ID)
    })

    function getInstance() {
      const em = {
        transactional: transactionalStub,
        remove: removeStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#completePartsBatch', () => {
    const BATCH_1_ID = 0
    const BATCH_1 = { id: BATCH_1_ID }

    const BATCH_2_ID = 1
    const BATCH_2 = { id: BATCH_2_ID }

    const BATCHES = [BATCH_1, BATCH_2] as unknown as BatchComplete[]

    const COMPLETE_RESULT = 'complete result'

    const completeBatchStub = stub()

    beforeEach(() => {
      completeBatchStub.reset()
      completeBatchStub.throws()
      completeBatchStub.withArgs(BATCHES).resolves(COMPLETE_RESULT)
    })

    it('should not catch error from completeBatch', async () => {
      const error = new Error('my error')
      completeBatchStub.reset()
      completeBatchStub.throws(error)

      await expect(getInstance().completePartsBatch(BATCHES)).to.be.rejectedWith(error)
    })

    it('should return the result of completeBatch', async () => {
      const res = await getInstance().completePartsBatch(BATCHES)

      expect(res).to.be.eq(COMPLETE_RESULT)
    })

    function getInstance() {
      const em = {} as unknown as SqlEntityManager
      const spaceReportPartService = {
        completeBatch: completeBatchStub,
      } as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#generateResult', () => {
    const REPORT_ID = 0
    const REPORT = { id: REPORT_ID } as unknown as SpaceReport

    const RESULT = 'result'

    const generateResultStub = stub()

    beforeEach(() => {
      generateResultStub.reset()
      generateResultStub.throws()
      generateResultStub.withArgs(REPORT).resolves(RESULT)
    })

    it('should not catch error from generateResult', async () => {
      const error = new Error('my error')
      generateResultStub.reset()
      generateResultStub.throws(error)

      await expect(getInstance().generateResult(REPORT)).to.be.rejectedWith(error)
    })

    it('should return the result of completeBatch', async () => {
      const res = await getInstance().generateResult(REPORT)

      expect(res).to.be.eq(RESULT)
    })

    it('should proxy styles when provided', async () => {
      const STYLES = 'styles'
      const RESULT_WITH_STYLES = 'result with styles'

      generateResultStub.withArgs(REPORT, STYLES).resolves(RESULT_WITH_STYLES)

      const res = await getInstance().generateResult(REPORT, STYLES)

      expect(res).to.be.eq(RESULT_WITH_STYLES)
    })

    function getInstance() {
      const em = {} as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {
        generateResult: generateResultStub,
      } as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#hasPendingBatch', () => {
    const REPORT_ID = 0
    const FIND_ONE_PARAMS = [SpaceReportPart, { spaceReport: REPORT_ID, state: 'CREATED' }]

    const findOneStub = stub()

    beforeEach(() => {
      findOneStub.reset()
      findOneStub.throws()
    })

    it('should not catch error from findOne', async () => {
      const error = new Error('my error')
      findOneStub.reset()
      findOneStub.throws(error)

      await expect(getInstance().hasPendingBatch(REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should return true if a batch is found', async () => {
      findOneStub.withArgs(...FIND_ONE_PARAMS).resolves({})

      const res = await getInstance().hasPendingBatch(REPORT_ID)

      expect(res).to.be.true()
    })

    it('should return false if no batch found', async () => {
      findOneStub.withArgs(...FIND_ONE_PARAMS).resolves(null)

      const res = await getInstance().hasPendingBatch(REPORT_ID)

      expect(res).to.be.false()
    })

    function getInstance() {
      const em = {
        findOne: findOneStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#setSpaceReportError', () => {
    const REPORT_ID = 0

    const findOneOrFailStub = stub()
    const transactionalStub = stub()

    beforeEach(() => {
      findOneOrFailStub.reset()
      findOneOrFailStub.throws()
      findOneOrFailStub.withArgs(SpaceReport, REPORT_ID).resolves({})

      transactionalStub.reset()
      transactionalStub.callsArg(0)
    })

    it('should run under transaction', async () => {
      await getInstance().setSpaceReportError(REPORT_ID)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should not catch error from findOneOrFail', async () => {
      const error = new Error('my error')
      findOneOrFailStub.reset()
      findOneOrFailStub.throws(error)

      await expect(getInstance().setSpaceReportError(REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().setSpaceReportError(REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should do or return anything, if the state is already ERROR', async () => {
      const ERROR_REPORT = { id: REPORT_ID, state: 'ERROR' }
      findOneOrFailStub.withArgs(SpaceReport, REPORT_ID).resolves(ERROR_REPORT)

      const res = await getInstance().setSpaceReportError(REPORT_ID)

      expect(ERROR_REPORT).to.have.property('state', 'ERROR')
      expect(res).to.be.null()
    })

    it('should update the space report and return it if the state is not already ERROR', async () => {
      const REPORT = { id: REPORT_ID, state: 'CREATED' }

      findOneOrFailStub.withArgs(SpaceReport, REPORT_ID).resolves(REPORT)

      const res = await getInstance().setSpaceReportError(REPORT_ID)

      expect(REPORT).to.have.property('state', 'ERROR')
      expect(res).to.eq(REPORT)
    })

    function getInstance() {
      const em = {
        findOneOrFail: findOneOrFailStub,
        transactional: transactionalStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#setSpaceReportPartsError', () => {
    const PART_1_ID = 0
    const PART_2_ID = 1
    const PART_IDS = [PART_1_ID, PART_2_ID]

    const setReportPartsErrorStub = stub()

    beforeEach(() => {
      setReportPartsErrorStub.reset()
      setReportPartsErrorStub.throws()
      setReportPartsErrorStub.withArgs(PART_IDS).resolves()
    })

    it('should not catch error from setReportPartsError', async () => {
      const error = new Error('my error')
      setReportPartsErrorStub.reset()
      setReportPartsErrorStub.throws(error)

      await expect(getInstance().setSpaceReportPartsError(PART_IDS)).to.be.rejectedWith(error)
    })

    it('should proxy the call', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(setReportPartsErrorStub.calledOnce).to.be.true()

      const args = setReportPartsErrorStub.getCall(0).args
      expect(args).to.have.length(1)
      expect(args[0]).to.have.length(2)
      expect(args[0]).to.include(PART_1_ID)
      expect(args[0]).to.include(PART_2_ID)
    })

    function getInstance() {
      const em = {} as unknown as SqlEntityManager
      const spaceReportPartService = {
        setReportPartsError: setReportPartsErrorStub,
      } as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#getSpacesForUser', () => {
    const USER_ID = 0
    const USER = { id: USER_ID } as unknown as User

    const SPACE_1_ID = 10
    const SPACE_1 = { id: SPACE_1_ID }

    const SPACE_2_ID = 20
    const SPACE_2 = { id: SPACE_2_ID }

    const SPACE_IDS = [SPACE_1_ID, SPACE_2_ID]
    const SPACES = [SPACE_1, SPACE_2]

    const createQueryBuilderStub = stub()
    const joinAndSelectedMembershipStub = stub()
    const joinAndSelectUserStub = stub()
    const whereStub = stub()
    const getResultStub = stub()

    beforeEach(() => {
      getResultStub.reset()
      getResultStub.resolves(SPACES)

      whereStub.reset()
      whereStub.throws()
      whereStub.withArgs({ 'space.id': SPACE_IDS, 'user.id': USER_ID }).returns({ getResult: getResultStub })

      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws()
      joinAndSelectUserStub.withArgs('membership.user', 'user').returns({ where: whereStub })

      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws()
      joinAndSelectedMembershipStub.withArgs('space.spaceMemberships', 'membership').returns({ joinAndSelect: joinAndSelectUserStub })

      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws()
      createQueryBuilderStub.withArgs(Space, 'space').returns({ joinAndSelect: joinAndSelectedMembershipStub })
    })

    it('should not catch error from queryBuilder', async () => {
      const error = new Error('my error')
      createQueryBuilderStub.reset()
      createQueryBuilderStub.throws(error)

      await expect(getInstance().getSpacesForUser(SPACE_IDS, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectedMembership', async () => {
      const error = new Error('my error')
      joinAndSelectedMembershipStub.reset()
      joinAndSelectedMembershipStub.throws(error)

      await expect(getInstance().getSpacesForUser(SPACE_IDS, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from joinAndSelectUser', async () => {
      const error = new Error('my error')
      joinAndSelectUserStub.reset()
      joinAndSelectUserStub.throws(error)

      await expect(getInstance().getSpacesForUser(SPACE_IDS, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from where', async () => {
      const error = new Error('my error')
      whereStub.reset()
      whereStub.throws(error)

      await expect(getInstance().getSpacesForUser(SPACE_IDS, USER)).to.be.rejectedWith(error)
    })

    it('should not catch error from getResult', async () => {
      const error = new Error('my error')
      getResultStub.reset()
      getResultStub.throws(error)

      await expect(getInstance().getSpacesForUser(SPACE_IDS, USER)).to.be.rejectedWith(error)
    })

    it('should return the result of getResult', async () => {
      const res = await getInstance().getSpacesForUser(SPACE_IDS, USER)

      expect(res).to.eq(SPACES)
    })

    function getInstance() {
      const em = {
        createQueryBuilder: createQueryBuilderStub,
      } as unknown as SqlEntityManager
      const spaceReportPartService = {} as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
  describe('#getSpaceReportPartMetaData', () => {
    const FILE_ID = 0
    const FILE = { id: FILE_ID } as unknown as UserFile
    const SOURCE: SpaceReportPartSourceEntity<SpaceReportPartSourceType> = { type: 'file', entity: FILE }
    const RESULT = 'RESULT'

    const getSpaceReportPartMetaDataStub = stub()

    beforeEach(() => {
      getSpaceReportPartMetaDataStub.reset()
      getSpaceReportPartMetaDataStub.throws()
      getSpaceReportPartMetaDataStub.withArgs(SOURCE).returns(RESULT)
    })

    it('should not catch error from getSpaceReportPartMetaData', () => {
      const error = new Error('my error')
      getSpaceReportPartMetaDataStub.reset()
      getSpaceReportPartMetaDataStub.throws(error)

      expect(() => getInstance().getSpaceReportPartMetaData(SOURCE)).to.throw(error)
    })

    it('should return the result of getSpaceReportPartMetaData', () => {
      const res = getInstance().getSpaceReportPartMetaData(SOURCE)

      expect(res).to.eq(RESULT)
    })

    function getInstance() {
      const em = {} as unknown as SqlEntityManager
      const spaceReportPartService = {
        getSpaceReportPartMetaData: getSpaceReportPartMetaDataStub,
      } as unknown as SpaceReportPartService
      const spaceReportResultService = {} as unknown as SpaceReportResultService

      return new SpaceReportService(em, spaceReportPartService, spaceReportResultService)
    }
  })
})
