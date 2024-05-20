import { LockMode, Ref, Reference } from '@mikro-orm/core'
import type { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { InvalidStateError } from '@shared/errors'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { SpaceReportResultGenerateFacade } from '@shared/facade/space-report/space-report-result-generate.facade'
import { expect } from 'chai'
import { restore, stub } from 'sinon'

describe('SpaceReportResultGenerateFacade', () => {
  const REPORT_ID = 0
  const REPORT_CREATED_AT = new Date('2023-09-01T14:58:08.000Z')
  const REPORT_FORMAT = 'HTML'

  const CREATOR_ID = 10
  const CREATOR_PRIVATE_PROJECT = 'CREATOR_PRIVATE_PROJECT'
  const CREATOR_FULL_NAME = 'CREATOR_FULL_NAME'
  const CREATOR = {
    id: CREATOR_ID,
    privateFilesProject: CREATOR_PRIVATE_PROJECT,
    fullName: CREATOR_FULL_NAME,
  }

  const SPACE_ID = 100
  const SPACE_NAME = 'space name'
  const SPACE_SCOPE = `space-${SPACE_ID}`
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
    createdBy: { id: CREATOR_ID, getEntity: () => CREATOR },
    scope: SPACE_SCOPE,
    createdAt: REPORT_CREATED_AT,
    format: REPORT_FORMAT,
  } as unknown as SpaceReport

  const SPACE_MEMBERSHIP_IS_HOST = true
  const SPACE_MEMBERSHIP = { isHost: () => SPACE_MEMBERSHIP_IS_HOST }

  const STYLES = 'styles'
  const RESULT = 'result'

  const FILE_ID = 1000
  const FILE_UID = 'file-uid-1'
  const FILE = { id: FILE_ID, uid: FILE_UID, state: 'open' }

  const transactionalStub = stub()
  const findOneStub = stub()
  const populateStub = stub()
  const generateResultStub = stub()
  const createFileWithContentStub = stub()
  const getSvgStylesStub = stub()
  const closeFileStub = stub()
  const findOneOrFailStub = stub()

  before(() => {
    stub(Reference, 'create')
      .withArgs(FILE)
      .returns({ load: () => Promise.resolve(FILE) } as unknown as Ref<object>)
  })

  beforeEach(() => {
    REPORT.state = 'CREATED'

    stubForReport(REPORT)

    transactionalStub.reset()
    transactionalStub.callsArg(0)

    findOneStub
      .withArgs(SpaceMembership, {
        spaces: SPACE_ID,
        user: CREATOR_ID,
        active: true,
      })
      .resolves(SPACE_MEMBERSHIP)

    getSvgStylesStub.resolves(STYLES)

    createFileWithContentStub.reset()
    createFileWithContentStub.throws()
    createFileWithContentStub
      .withArgs({
        scope: SPACE_SCOPE,
        project: SPACE_HOST_PROJECT,
        name: `PFDA - Space 100 report - ${REPORT_CREATED_AT.toLocaleDateString()}.html`,
        content: RESULT,
        description: `Report of a precisionFDA space space name, generated on ${REPORT_CREATED_AT.toLocaleString()}`,
      })
      .resolves(FILE)

    closeFileStub.reset()
    closeFileStub.throws()
    closeFileStub.withArgs(FILE_UID).resolves()

    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(Space, SPACE_ID).resolves(SPACE)
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

  it('should not catch an error from getSvgStyles', async () => {
    const error = new Error('my error')
    getSvgStylesStub.reset()
    getSvgStylesStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should not catch an error from closeFile', async () => {
    const error = new Error('my error')
    closeFileStub.reset()
    closeFileStub.throws(error)

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(error)
  })

  it('should update the report with result file and state', async () => {
    await getInstance().generate(REPORT_ID)

    expect(REPORT.id).to.eq(REPORT_ID)
    expect(REPORT.createdBy.id).to.eq(CREATOR_ID)
    expect(REPORT.scope).to.deep.eq(SPACE_SCOPE)
    expect(REPORT.createdAt).to.eq(REPORT_CREATED_AT)
    expect(await REPORT.resultFile.load()).to.deep.eq(FILE)
    expect(REPORT.state).to.eq('CLOSING_RESULT_FILE')
  })

  it('should start closing the result file', async () => {
    await getInstance().generate(REPORT_ID)

    expect(closeFileStub.calledOnce).to.be.true()
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
        description: `Report of a precisionFDA space space name, generated on ${REPORT_CREATED_AT.toLocaleString()}`,
      })
      .resolves(FILE)

    await getInstance().generate(REPORT_ID)

    expect(createFileWithContentStub.calledOnce).to.be.true()
  })

  it('should attempt to close a file even if it has already been generated for that report', async () => {
    REPORT.state = 'CLOSING_RESULT_FILE'
    REPORT.resultFile = { load: () => Promise.resolve(FILE) } as unknown as Ref<UserFile>

    await getInstance().generate(REPORT_ID)

    expect(closeFileStub.calledOnce).to.be.true()
  })

  it('should throw an error if the report has result file created and in open state, but the report is not in CLOSING_RESULT_FILE state', async () => {
    REPORT.state = 'DONE'
    REPORT.resultFile = { load: () => Promise.resolve(FILE) } as unknown as Ref<UserFile>

    await expect(getInstance().generate(REPORT_ID)).to.be.rejectedWith(
      InvalidStateError,
      'Failed to generate a space report. Report result file is in an open state, but report is in an unexpected state. Current report state: "DONE"',
    )
  })

  it('should call create file with correct params for a private scope report', async () => {
    stubForReport({
      ...REPORT,
      scope: 'private',
    })

    createFileWithContentStub.reset()
    createFileWithContentStub.throws()
    createFileWithContentStub
      .withArgs({
        scope: 'private',
        project: CREATOR_PRIVATE_PROJECT,
        name: `PFDA - Private area (CREATOR_FULL_NAME) report - ${REPORT_CREATED_AT.toLocaleDateString()}.html`, //PFDA - Space 100 report - ${REPORT_CREATED_AT.toLocaleDateString()}.html`,
        content: RESULT,
        description: `Report of precisionFDA private area of user CREATOR_FULL_NAME, generated on ${REPORT_CREATED_AT.toLocaleString()}`,
      })
      .resolves(FILE)

    await getInstance().generate(REPORT_ID)

    expect(createFileWithContentStub.calledOnce).to.be.true()
  })

  function stubForReport(report) {
    findOneStub.reset()
    findOneStub.throws()
    findOneStub
      .withArgs(SpaceReport, REPORT_ID, { lockMode: LockMode.PESSIMISTIC_WRITE })
      .resolves(report)

    populateStub.reset()
    populateStub.throws()
    populateStub.withArgs(report, ['reportParts', 'createdBy']).returnsArg(0)

    generateResultStub.reset()
    generateResultStub.throws()
    generateResultStub.withArgs(report, { styles: STYLES }).resolves(RESULT)
  }

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      findOne: findOneStub,
      populate: populateStub,
      findOneOrFail: findOneOrFailStub,
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

    const userFileService = {
      closeFile: closeFileStub,
    } as unknown as UserFileService

    return new SpaceReportResultGenerateFacade(
      em,
      spaceReportService,
      userFileCreateFacade,
      entityProvenanceService,
      userFileService,
    )
  }
})
