import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { stub } from 'sinon'
import { expect } from 'chai'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import {
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
} from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'

describe('LockNodeFacade', () => {
  const file1 = {
    id: 4,
    stiType: FILE_STI_TYPE.USERFILE,
    state: FILE_STATE_PFDA.REMOVING,
  } as UserFile
  const file2 = {
    id: 5,
    stiType: FILE_STI_TYPE.USERFILE,
    state: FILE_STATE_PFDA.REMOVING,
  } as UserFile
  const asset = {
    id: 9,
    uid: 'file-ABC-1',
    stiType: FILE_STI_TYPE.ASSET,
    state: FILE_STATE_PFDA.REMOVING,
  } as unknown as UserFile

  let nodeServiceLoadNodesStub = stub()
  let nodeServiceLockFileStub = stub()
  let notificationServiceCreateNotificationStub = stub()
  let nodeHelperFilterNodesByUserStub = stub()
  let emFlushStub = stub()
  let createLockNodesJobTaskStub = stub()

  const em = {
    flush: emFlushStub,
  } as unknown as SqlEntityManager
  const userCtx = {
    id: 12345,
  } as unknown as UserContext
  const nodeHelper = {
    filterNodesByUser: nodeHelperFilterNodesByUserStub,
  } as unknown as NodeHelper
  const nodeService = {
    loadNodes: nodeServiceLoadNodesStub,
    lockFile: nodeServiceLockFileStub,
  } as unknown as NodeService
  const notificationService = {
    createNotification: notificationServiceCreateNotificationStub,
  } as unknown as NotificationService
  const fileSyncQueueJobProducer = {
    createLockNodesJobTask: createLockNodesJobTaskStub,
  } as unknown as FileSyncQueueJobProducer

  beforeEach(() => {
    nodeServiceLoadNodesStub.reset()
    nodeServiceLoadNodesStub.throws()

    nodeServiceLockFileStub.reset()
    nodeServiceLockFileStub.throws()

    notificationServiceCreateNotificationStub.reset()
    notificationServiceCreateNotificationStub.throws()

    nodeHelperFilterNodesByUserStub.reset()
    nodeHelperFilterNodesByUserStub.throws()

    emFlushStub.reset()
    emFlushStub.throws()

    createLockNodesJobTaskStub.reset()
    createLockNodesJobTaskStub.throws()
  })

  describe('#lockNodes', async () => {
    it('sync', async () => {
      nodeServiceLoadNodesStub
        .withArgs([file1.id, file2.id], { locked: false })
        .resolves([file1, file2])
      nodeHelperFilterNodesByUserStub.withArgs([file1, file2]).resolves([file1, file2])
      nodeServiceLockFileStub.reset()
      const facade = getInstance()

      await facade.lockNodes([file1.id, file2.id], false)

      expect(nodeServiceLockFileStub.callCount).to.equal(2)
      expect(nodeServiceLockFileStub.getCall(0).args[0]).to.equal(file1.id)
      expect(nodeServiceLockFileStub.getCall(1).args[0]).to.equal(file2.id)
    })

    it('async', async () => {
      nodeServiceLoadNodesStub
        .withArgs([file1.id, file2.id], { locked: false })
        .resolves([file1, file2])
      nodeHelperFilterNodesByUserStub.withArgs([file1, file2]).resolves([file1, file2])
      nodeServiceLockFileStub.reset()
      notificationServiceCreateNotificationStub.reset()
      const facade = getInstance()

      await facade.lockNodes([file1.id, file2.id], true)

      expect(nodeServiceLockFileStub.callCount).to.equal(2)
      expect(nodeServiceLockFileStub.getCall(0).args[0]).to.equal(file1.id)
      expect(nodeServiceLockFileStub.getCall(1).args[0]).to.equal(file2.id)

      expect(notificationServiceCreateNotificationStub.calledOnce).to.be.true()
      expect(notificationServiceCreateNotificationStub.getCall(0).args[0]).to.deep.include({
        message: 'Successfully locked 2 files',
        userId: userCtx.id,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.NODES_LOCKED,
      })
    })

    it('unsupported node type', async () => {
      nodeServiceLoadNodesStub
        .withArgs([file1.id, asset.id], { locked: false })
        .resolves([file1, asset])
      nodeHelperFilterNodesByUserStub.withArgs([file1, asset]).resolves([file1, asset])
      nodeServiceLockFileStub.reset()
      notificationServiceCreateNotificationStub.reset()
      emFlushStub.reset()
      const facade = getInstance()

      await expect(facade.lockNodes([file1.id, asset.id], true)).to.be.rejectedWith(
        InvalidStateError,
        `Unsupported node type "Asset" of node uid: ${asset.uid}`,
      )
      expect(emFlushStub.calledOnce).to.be.true()
      expect(file1.state).to.eq(FILE_STATE_DX.CLOSED)
      expect(asset.state).to.eq(FILE_STATE_DX.CLOSED)
    })
  })

  function getInstance(): LockNodeFacade {
    return new LockNodeFacade(em, userCtx, nodeHelper, nodeService, notificationService, fileSyncQueueJobProducer)
  }
})
