import { LockMode, Reference } from '@mikro-orm/core'
import type { SqlEntityManager } from '@mikro-orm/mysql'
import type { notification } from '@shared'
import { ENUMS } from '@shared'
import { SpaceMembership } from '@shared/domain'
import {
  EntityProvenanceService
} from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { expect } from 'chai'
import { restore, stub } from 'sinon'
import {
  SpaceReportResultGenerateFacade
} from '../../src/facade/space-report/space-report-result-generate.facade'

describe('SpaceReportResultGenerateFacade', () => {
  const REPORT_ID = 0
  const REPORT_CREATED_AT = new Date('2023-09-01T14:58:08.000Z')

  const CREATOR_ID = 10
  const CREATOR = { id: CREATOR_ID }

  const SPACE_ID = 100
  const SPACE_NAME = 'space name'
  const SPACE_SCOPE = 'space scope'
  const SPACE_HOST_PROJECT = 'space host project'
  const SPACE_GUEST_PROJECT = 'space guest project'
  const SPACE = {
    id: SPACE_ID,
    name: SPACE_NAME,
    scope: SPACE_SCOPE,
    hostProject: SPACE_HOST_PROJECT,
    guestProject: SPACE_GUEST_PROJECT,
  }

  const REPORT = {
    id: REPORT_ID,
    createdBy: CREATOR,
    space: SPACE,
    createdAt: REPORT_CREATED_AT,
  }

  const SPACE_MEMBERSHIP_IS_HOST = true
  const SPACE_MEMBERSHIP = { isHost: () => SPACE_MEMBERSHIP_IS_HOST }

  const STYLES = 'styles'
  const RESULT = 'result'

  const FILE_ID = 1000
  const FILE = { id: FILE_ID }

  const transactionalStub = stub()
  const findOneStub = stub()
  const populateStub = stub()
  const generateResultStub = stub()
  const createFileWithContentStub = stub()
  const createNotificationStub = stub()
  const getSvgStylesStub = stub()

  before(() => {
    stub(Reference, 'create').withArgs(FILE).returns(FILE)
  })

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.callsArg(0)

    findOneStub.reset()
    findOneStub.throws()
    findOneStub
      .withArgs(
        SpaceReport,
        { id: REPORT_ID, state: { $in: ['CREATED', 'ERROR'] } },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      )
      .resolves(REPORT)
      .withArgs(SpaceMembership, {
        spaces: SPACE_ID,
        user: CREATOR_ID,
        active: true,
      })
      .resolves(SPACE_MEMBERSHIP)

    populateStub.reset()
    populateStub.throws()
    populateStub.withArgs(REPORT, ['reportParts', 'space', 'createdBy']).returnsArg(0)

    getSvgStylesStub.resolves(STYLES)

    generateResultStub.reset()
    generateResultStub.throws()
    generateResultStub.withArgs(REPORT, STYLES).resolves(RESULT)

    createFileWithContentStub.reset()
    createFileWithContentStub.throws()
    createFileWithContentStub
      .withArgs({
        scope: SPACE_SCOPE,
        project: SPACE_HOST_PROJECT,
        name: `PFDA - Space 100 report - ${REPORT_CREATED_AT.toLocaleDateString()}.html`,
        content: RESULT,
        description: `Report of a precisionFDA space space name, generatad on ${REPORT_CREATED_AT.toLocaleString()}`,
      })
      .resolves(FILE)

    createNotificationStub.reset()
    createNotificationStub.throws()
    createNotificationStub
      .withArgs({
        severity: ENUMS.SEVERITY.INFO,
        userId: CREATOR_ID,
        message: 'Report of space "space name" successfully generated',
        action: ENUMS.NOTIFICATION_ACTION.SPACE_REPORT_DONE,
        meta: {
          linkTitle: 'Go to Reports',
          linkUrl: '/spaces/100/reports',
        },
      })
      .resolves()
  })

  after(() => {
    restore()
  })

  it('should run under transaction', async () => {
    await getInstance().generate(REPORT_ID)

    expect(transactionalStub.calledOnce).to.be.true()
  })

  it('should not catch an error from transactional', async () => {
    const error = new Error('my error')
    transactionalStub.reset()
    transactionalStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from findOne', async () => {
    const error = new Error('my error')
    findOneStub.reset()
    findOneStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from populate', async () => {
    const error = new Error('my error')
    populateStub.reset()
    populateStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from generateResult', async () => {
    const error = new Error('my error')
    generateResultStub.reset()
    generateResultStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from createFileWithContent', async () => {
    const error = new Error('my error')
    createFileWithContentStub.reset()
    createFileWithContentStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from createNotification', async () => {
    const error = new Error('my error')
    createNotificationStub.reset()
    createNotificationStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from getSvgStyles', async () => {
    const error = new Error('my error')
    getSvgStylesStub.reset()
    getSvgStylesStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should update the report with result file and state', async () => {
    await getInstance().generate(REPORT_ID)

    expect(REPORT).to.deep.eq({
      id: REPORT_ID,
      createdBy: CREATOR,
      space: SPACE,
      createdAt: REPORT_CREATED_AT,
      resultFile: FILE,
      state: 'DONE',
    })
  })

  it('should create notification', async () => {
    await getInstance().generate(REPORT_ID)

    expect(createNotificationStub.calledOnce).to.be.true()
  })

  it('should use guest project when membership is not host', async () => {
    findOneStub
      .withArgs(SpaceMembership, {
        spaces: SPACE_ID,
        user: CREATOR_ID,
        active: true,
      })
      .resolves({ isHost: () => false })

    createFileWithContentStub.reset()
    createFileWithContentStub.throws()
    createFileWithContentStub
      .withArgs({
        scope: SPACE_SCOPE,
        project: SPACE_GUEST_PROJECT,
        name: `PFDA - Space 100 report - ${REPORT_CREATED_AT.toLocaleDateString()}.html`,
        content: RESULT,
        description: `Report of a precisionFDA space space name, generatad on ${REPORT_CREATED_AT.toLocaleString()}`,
      })
      .resolves(FILE)

    await getInstance().generate(REPORT_ID)

    expect(createFileWithContentStub.calledOnce).to.be.true()
  })

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      findOne: findOneStub,
      populate: populateStub,
    } as unknown as SqlEntityManager

    const spaceReportService = {
      generateResult: generateResultStub,
    } as unknown as SpaceReportService

    const userFileCreateFacade = {
      createFileWithContent: createFileWithContentStub,
    } as unknown as UserFileCreateFacade

    const entityProvenanceService = {
      getSvgStyles: getSvgStylesStub,
    } as unknown as EntityProvenanceService

    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as notification.NotificationService

    return new SpaceReportResultGenerateFacade(
      em,
      spaceReportService,
      userFileCreateFacade,
      notificationService,
      entityProvenanceService,
    )
  }
})
