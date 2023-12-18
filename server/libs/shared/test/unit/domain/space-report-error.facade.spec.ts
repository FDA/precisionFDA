import { SqlEntityManager } from '@mikro-orm/mysql'
import { ENUMS } from '@shared'
import { expect } from 'chai'
import { stub } from 'sinon'
import { NotificationService } from '../../../src/domain/notification'
import { SpaceReportPart, SpaceReportService } from '../../../src/domain/space-report'
import { SpaceReportErrorFacade } from '../../../src/facade/space-report-error/space-report-error.facade'

describe('SpaceReportErrorFacade', () => {
  const SPACE_REPORT_ID = 0
  const SPACE_REPORT_CREATOR_ID = 10
  const SPACE_REPORT = { id: SPACE_REPORT_ID, createdBy: { id: SPACE_REPORT_CREATOR_ID } }

  const transactionalStub = stub()
  const findOneStub = stub()
  const setSpaceReportErrorStub = stub()
  const setSpaceReportPartsErrorStub = stub()
  const createNotificationStub = stub()

  beforeEach(() => {
    setSpaceReportErrorStub.reset()
    setSpaceReportErrorStub.throws()
    setSpaceReportErrorStub.withArgs(SPACE_REPORT_ID).resolves(SPACE_REPORT)

    createNotificationStub.reset()
    createNotificationStub.throws()
    createNotificationStub
      .withArgs({
        severity: ENUMS.SEVERITY.ERROR,
        userId: SPACE_REPORT_CREATOR_ID,
        message: 'Space report generation failed',
        action: ENUMS.NOTIFICATION_ACTION.SPACE_REPORT_ERROR,
      })
      .resolves()

    transactionalStub.reset()
    transactionalStub.throws()

    setSpaceReportPartsErrorStub.reset()
    setSpaceReportPartsErrorStub.throws()

    findOneStub.reset()
    findOneStub.throws()
  })

  describe('#setSpaceReportError', () => {
    it('should not catch error from setSpaceReportError', async () => {
      const error = new Error('my error')
      setSpaceReportErrorStub.reset()
      setSpaceReportErrorStub.throws(error)

      await expect(getInstance().setSpaceReportError(SPACE_REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should not catch error from createNotification', async () => {
      const error = new Error('my error')
      createNotificationStub.reset()
      createNotificationStub.throws(error)

      await expect(getInstance().setSpaceReportError(SPACE_REPORT_ID)).to.be.rejectedWith(error)
    })

    it('should call setSpaceReportError', async () => {
      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(setSpaceReportErrorStub.calledOnce).to.be.true()
    })

    it('should call createNotification if report returned', async () => {
      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(createNotificationStub.calledOnce).to.be.true()
    })

    it('should not call createNotification if report not returned', async () => {
      setSpaceReportErrorStub.withArgs(SPACE_REPORT_ID).resolves(null)

      await getInstance().setSpaceReportError(SPACE_REPORT_ID)

      expect(createNotificationStub.called).to.be.false()
    })
  })
  describe('#setSpaceReportPartsError', () => {
    const PART_1_ID = 100
    const PART_1 = { id: PART_1_ID, spaceReport: { id: SPACE_REPORT_ID } }

    const PART_2_ID = 200

    const PART_IDS = [PART_1_ID, PART_2_ID]

    beforeEach(() => {
      transactionalStub.reset()
      transactionalStub.callsArg(0)

      setSpaceReportPartsErrorStub.withArgs(PART_IDS).resolves()

      findOneStub.withArgs(SpaceReportPart, PART_IDS).resolves(PART_1)
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().setSpaceReportPartsError(PART_IDS)).to.be.rejectedWith(error)
    })

    it('should not catch error from setSpaceReportPartsError', async () => {
      const error = new Error('my error')
      setSpaceReportPartsErrorStub.reset()
      setSpaceReportPartsErrorStub.throws(error)

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
      expect(setSpaceReportErrorStub.called).to.be.false()
      expect(setSpaceReportPartsErrorStub.called).to.be.false()
    })

    it('should not do anything if empty ids provided', async () => {
      await getInstance().setSpaceReportPartsError([])

      expect(transactionalStub.called).to.be.false()
      expect(createNotificationStub.called).to.be.false()
      expect(setSpaceReportErrorStub.called).to.be.false()
      expect(setSpaceReportPartsErrorStub.called).to.be.false()
    })

    it('should run under transaction', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('should call setSpaceReportPartsError', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(setSpaceReportPartsErrorStub.calledOnce).to.be.true()
    })

    it('should call setSpaceReportError', async () => {
      await getInstance().setSpaceReportPartsError(PART_IDS)

      expect(setSpaceReportErrorStub.calledOnce).to.be.true()
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
    } as unknown as SqlEntityManager

    const spaceReportService = {
      setSpaceReportError: setSpaceReportErrorStub,
      setSpaceReportPartsError: setSpaceReportPartsErrorStub,
    } as unknown as SpaceReportService

    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService

    return new SpaceReportErrorFacade(em, spaceReportService, notificationService)
  }
})
