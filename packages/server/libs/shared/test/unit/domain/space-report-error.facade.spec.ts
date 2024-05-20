import { SqlEntityManager } from '@mikro-orm/mysql'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { SpaceReportErrorFacade } from '@shared/facade/space-report/space-report-error.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportErrorFacade', () => {
  const SPACE_REPORT_ID = 0
  const SPACE_REPORT_CREATOR_ID = 10

  let SPACE_REPORT

  const PART_1_ID = 100
  const PART_1 = { id: PART_1_ID, spaceReport: { id: SPACE_REPORT_ID } }

  const PART_2_ID = 200

  const PART_IDS = [PART_1_ID, PART_2_ID]

  const transactionalStub = stub()
  const findOneStub = stub()
  const findOneOrFailStub = stub()
  const createNotificationStub = stub()
  const nativeUpdateStub = stub()

  beforeEach(() => {
    SPACE_REPORT = {
      id: SPACE_REPORT_ID,
      state: 'CREATED',
      createdBy: { id: SPACE_REPORT_CREATOR_ID },
    }

    createNotificationStub.reset()
    createNotificationStub.throws()
    createNotificationStub
      .withArgs({
        severity: SEVERITY.ERROR,
        userId: SPACE_REPORT_CREATOR_ID,
        message: 'Space report generation failed',
        action: NOTIFICATION_ACTION.SPACE_REPORT_ERROR,
      })
      .resolves()

    transactionalStub.reset()
    transactionalStub.callsArg(0)

    findOneStub.reset()
    findOneStub.throws()

    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(SpaceReport, SPACE_REPORT_ID).resolves(SPACE_REPORT)

    nativeUpdateStub.reset()
    nativeUpdateStub.throws()
  })

  describe('#setSpaceReportError', () => {
    it('should run under transaction', async () => {
      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should not catch error from findOneOrFail', async () => {
      const error = new Error('my error')
      findOneOrFailStub.reset()
      findOneOrFailStub.throws(error)

      await expect(getInstance().setSpaceReportError(SPACE_REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().setSpaceReportError(SPACE_REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should not change the state, if it is already ERROR', async () => {
      const ERROR_REPORT = { ...SPACE_REPORT, state: 'ERROR' }
      findOneOrFailStub.withArgs(SpaceReport, SPACE_REPORT_ID).resolves(ERROR_REPORT)

      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(ERROR_REPORT).to.have.property('state', 'ERROR')
    })

    it('should not change the state, if it is already DONE', async () => {
      const DONE_REPORT = { ...SPACE_REPORT, state: 'DONE' }
      findOneOrFailStub.withArgs(SpaceReport, SPACE_REPORT_ID).resolves(DONE_REPORT)

      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(DONE_REPORT).to.have.property('state', 'DONE')
    })

    it('should update the space report state to ERROR', async () => {
      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(SPACE_REPORT).to.have.property('state', 'ERROR')
    })

    // ___OLD___

    it('should not catch error from createNotification', async () => {
      const error = new Error('my error')
      createNotificationStub.reset()
      createNotificationStub.throws(error)

      await expect(getInstance().setSpaceReportError(SPACE_REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should call createNotification', async () => {
      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(createNotificationStub.calledOnce).to.be.true()
    })

    it('should not call createNotification if report is already in error state', async () => {
      const ERROR_REPORT = { ...SPACE_REPORT, state: 'ERROR' }
      findOneOrFailStub.withArgs(SpaceReport, SPACE_REPORT_ID).resolves(ERROR_REPORT)

      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(createNotificationStub.called).to.be.false()
    })
  })

  describe('#setSpaceReportPartsError', () => {
    beforeEach(() => {
      findOneStub.withArgs(SpaceReportPart, PART_IDS).resolves(PART_1)

      nativeUpdateStub
        .withArgs(SpaceReportPart, { id: { $in: PART_IDS } }, { state: 'ERROR' })
        .resolves()
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().setSpaceReportPartsError(PART_IDS)).to.be.rejectedWith(error)
    })

    it('should not catch error from findOne', async () => {
      const error = new Error('my error')
      findOneStub.reset()
      findOneStub.throws(error)

      await expect(getInstance().setSpaceReportPartsError(PART_IDS)).to.be.rejectedWith(error)
    })

    it('should not do anything if no ids provided', async () => {
      await getInstance().setSpaceReportPartsError(null)

      expect(transactionalStub.called).to.be.false()
      expect(createNotificationStub.called).to.be.false()
    })

    it('should not do anything if empty ids provided', async () => {
      await getInstance().setSpaceReportPartsError([])

      expect(transactionalStub.called).to.be.false()
      expect(createNotificationStub.called).to.be.false()
    })

    it('should run under transaction', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(transactionalStub.calledTwice).to.be.true()
    })

    it('should update parts', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(nativeUpdateStub.calledOnce).to.be.true()
    })

    it('should create notification', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(createNotificationStub.calledOnce).to.be.true()
    })
  })

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      findOne: findOneStub,
      findOneOrFail: findOneOrFailStub,
      nativeUpdate: nativeUpdateStub,
    } as unknown as SqlEntityManager

    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService

    return new SpaceReportErrorFacade(em, notificationService)
  }
})
