import { Job } from 'bull'
import { expect } from 'chai'
import { stub } from 'sinon'
import { Logger } from '@nestjs/common'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { CopyNodesJob } from '@shared/queue/task.input'
import { FileSyncQueueProcessor } from '../../src/domain/user-file/processor/file-sync-queue.processor'

describe('FileSyncQueueProcessor', () => {
  const copyNodesFacadeStub = stub()
  const loggerErrorStub = stub()

  beforeEach(() => {
    copyNodesFacadeStub.reset()
    loggerErrorStub.reset()
  })

  function getInstance(): FileSyncQueueProcessor {
    const processor = new FileSyncQueueProcessor(
      {} as unknown as UserContext,
      {} as unknown as UserDataConsistencyReportFacade,
      {} as unknown as LockNodeFacade,
      {} as unknown as UnlockNodeFacade,
      {} as unknown as RemoveNodesFacade,
      { copyNodes: copyNodesFacadeStub } as unknown as CopyNodesFacade,
      {} as unknown as NotificationService,
      {} as unknown as JobService,
      {} as unknown as JobWorkstationFacade,
    )
    ;(processor as unknown as { logger: object }).logger = {
      log: stub(),
      error: loggerErrorStub,
      warn: stub(),
    } as unknown as Logger
    return processor
  }

  function buildJob(): Job<CopyNodesJob> {
    return {
      data: {
        payload: { ids: [1, 2], scope: 'space-1', folderId: 5 },
      },
    } as unknown as Job<CopyNodesJob>
  }

  describe('#copyNodes', () => {
    it('delegates to the copy nodes facade', async () => {
      copyNodesFacadeStub.resolves([])

      await getInstance().copyNodes(buildJob())

      expect(copyNodesFacadeStub.calledOnceWith([1, 2], 'space-1', 5)).to.be.true()
    })

    it('does not rethrow facade errors so Bull will not retry the non-idempotent copy', async () => {
      // A rethrow would make Bull replay projectClone and re-emit the
      // facade's error notification on every retry attempt (queue default
      // is attempts: 15). The facade already notified the user.
      copyNodesFacadeStub.rejects(new Error('copy failed'))

      await getInstance().copyNodes(buildJob())

      expect(loggerErrorStub.calledOnce).to.be.true()
      expect(loggerErrorStub.firstCall.args[0]).to.contain('Copy nodes task failed')
    })
  })
})
