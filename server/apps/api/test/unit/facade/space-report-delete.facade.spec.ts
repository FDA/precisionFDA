import type { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { NodesRemoveOperation } from '@shared/domain/user-file/ops/nodes-remove'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { expect } from 'chai'
import type { SinonStub } from 'sinon'
import { stub } from 'sinon'
import { SpaceReportDeleteFacade } from '../../../src/facade/space-report/space-report-delete.facade'

describe('SpaceReportDeleteFacade', () => {
  const SPACE_REPORT_1_ID = 0
  const SPACE_REPORT_2_ID = 1
  const SPACE_REPORT_IDS = [SPACE_REPORT_1_ID, SPACE_REPORT_2_ID]

  const SPACE_REPORT_1_STATE = 'DONE'
  const SPACE_REPORT_2_STATE = 'ERROR'

  const SPACE_1_ID = 10
  const SPACE_2_ID = 20
  const SPACE_IDS = [SPACE_1_ID, SPACE_2_ID]

  const SPACE_1 = { id: SPACE_1_ID }
  const SPACE_2 = { id: SPACE_2_ID }
  const SPACES = [SPACE_1, SPACE_2]

  const FILE_1_ID = 100
  const FILE_2_ID = 200
  const FILE_IDS = [FILE_1_ID, FILE_2_ID]

  const FILE_1 = { id: FILE_1_ID }
  const FILE_2 = { id: FILE_2_ID }

  const SPACE_REPORT_1 = {
    id: SPACE_REPORT_1_ID,
    space: SPACE_1,
    resultFile: FILE_1,
    state: SPACE_REPORT_1_STATE,
  }
  const SPACE_REPORT_2 = {
    id: SPACE_REPORT_2_ID,
    space: SPACE_2,
    resultFile: FILE_2,
    state: SPACE_REPORT_2_STATE,
  }

  const SPACE_REPORTS = [SPACE_REPORT_1, SPACE_REPORT_2]

  let transactionalStub: SinonStub
  let getReportsStub: SinonStub
  let getSpacesForUserStub: SinonStub
  let deleteReportsStub: SinonStub
  let nodesRemoveExecuteStub: SinonStub

  beforeEach(() => {
    transactionalStub = stub().callsArg(0)

    getReportsStub = stub().throws()
    getReportsStub.withArgs(SPACE_REPORT_IDS).returns(SPACE_REPORTS)

    getSpacesForUserStub = stub().throws()
    getSpacesForUserStub.withArgs(SPACE_IDS).returns(SPACES)

    deleteReportsStub = stub().throws()
    deleteReportsStub.withArgs(SPACE_REPORTS).returns(SPACE_REPORT_IDS)

    nodesRemoveExecuteStub = stub().throws()
    nodesRemoveExecuteStub.withArgs({ ids: FILE_IDS, async: false }).returns(undefined)
  })

  it('should run under transaction', async () => {
    await getInstance().deleteSpaceReports(SPACE_REPORT_IDS)

    expect(transactionalStub.calledOnce).to.be.true()
  })

  it('should not catch error from getReports and rollback transaction', async () => {
    const error = new Error('my error')
    getReportsStub = stub().throws(error)

    await expectReject(error)
  })

  it('should not catch error from getSpacesForUser and rollback transaction', async () => {
    const error = new Error('my error')
    getSpacesForUserStub = stub().throws(error)

    await expectReject(error)
  })

  it('should not catch error from deleteReports and rollback transaction', async () => {
    const error = new Error('my error')
    deleteReportsStub = stub().throws(error)

    await expectReject(error)
  })

  it('should not catch error from nodesRemoveOperation and rollback transaction', async () => {
    const error = new Error('my error')
    nodesRemoveExecuteStub = stub().throws(error)

    await expectReject(error)
  })

  it('should throw an error if no reports found and rollback transaction', async () => {
    getReportsStub.withArgs(SPACE_REPORT_IDS).returns([])

    await expectReject(NotFoundError, 'Space report not found')
  })

  it('should throw an error if some reports not found and rollback transaction', async () => {
    getReportsStub.withArgs(SPACE_REPORT_IDS).returns([SPACE_REPORT_1])

    await expectReject(NotFoundError, 'Space report not found')
  })

  it('should throw an error if some reports not in a terminal state and rollback transaction', async () => {
    const SPACE_REPORT_2_NON_TERMINAL = { ...SPACE_REPORT_2, state: 'CREATED' }
    getReportsStub.withArgs(SPACE_REPORT_IDS).returns([SPACE_REPORT_1, SPACE_REPORT_2_NON_TERMINAL])

    await expectReject(InvalidStateError, 'Cannot delete a report in non terminal state')
  })

  it('should throw an error if no spaces found and rollback transaction', async () => {
    getSpacesForUserStub.withArgs(SPACE_IDS).returns([])

    await expectReject(NotFoundError, 'Space not found')
  })

  it('should throw an error if some spaces not found and rollback transaction', async () => {
    getSpacesForUserStub.withArgs(SPACE_IDS).returns([SPACE_2])

    await expectReject(NotFoundError, 'Space not found')
  })

  it('should call nodesRemoveOperation with all file ids', async () => {
    await getInstance().deleteSpaceReports(SPACE_REPORT_IDS)

    expect(nodesRemoveExecuteStub.calledOnce).to.be.true()
  })

  it('should return the result of deleteReports', async () => {
    const result = getInstance().deleteSpaceReports(SPACE_REPORT_IDS)

    expect(await result).to.be.eq(SPACE_REPORT_IDS)
  })

  async function expectReject(error: Error | Function, message?: string) {
    const result = getInstance().deleteSpaceReports(SPACE_REPORT_IDS)

    await expect(result).to.be.rejectedWith(error, message)
    await expect(transactionalStub.getCall(0).returnValue).to.be.rejected()
  }

  function getInstance() {
    const em = { transactional: transactionalStub } as unknown as SqlEntityManager

    const spaceReportService = {
      getReports: getReportsStub,
      getSpacesForUser: getSpacesForUserStub,
      deleteReports: deleteReportsStub,
    } as unknown as SpaceReportService

    const nodesRemoveOperation = {
      execute: nodesRemoveExecuteStub,
    } as unknown as NodesRemoveOperation

    return new SpaceReportDeleteFacade(em, spaceReportService, nodesRemoveOperation)
  }
})
