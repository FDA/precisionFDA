import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Job } from 'bull'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { FILE_STATE_DX, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { PlatformClient } from '@shared/platform-client'
import { FileStateResult } from '@shared/platform-client/platform-client.responses'
import { TASK_TYPE } from '@shared/queue/task.input'
import { mocksReset } from '@shared/test/mocks'

describe('SyncFilesStateFacade', () => {
  const user = {
    id: 10,
    dxuser: 'dxuser',
  } as unknown as User

  const platformClientFileStatesStub = stub()
  const challengeServiceUpdateCardImageUrlStub = stub()
  const emFlushStub = stub()
  const removeNodesFacadeRemoveFileStub = stub()
  const nodeHelperFindRecentClosingFilesAndAssetsStub = stub()
  const nodeHelperFindOldClosingFilesAndAssetsStub = stub()
  const nodeHelperFindOldOpenFilesAndAssetsStub = stub()
  const dataPortalServiceResetPortalImageStub = stub()

  let findUnclosedFilesOrAssetsStub: SinonStub
  let findFileOrAssetWithUidStub: SinonStub
  let findFileOrAssetsWithDxidStub: SinonStub

  const em = {
    flush: emFlushStub,
    transactional: (fn: (em: unknown) => Promise<unknown>) => fn(em),
  } as unknown as SqlEntityManager
  const nodeHelper = {
    findRecentClosingFilesAndAssets: nodeHelperFindRecentClosingFilesAndAssetsStub,
    findOldClosingFilesAndAssets: nodeHelperFindOldClosingFilesAndAssetsStub,
    findOldOpenFilesAndAssets: nodeHelperFindOldOpenFilesAndAssetsStub,
  } as unknown as NodeHelper
  const userCtx = {
    dxuser: user.dxuser,
    async loadEntity(): Promise<User> {
      return user
    },
  } as unknown as UserContext
  const platformClient = {
    fileStates: platformClientFileStatesStub,
  } as unknown as PlatformClient
  const challengeService = {
    updateCardImageUrl: challengeServiceUpdateCardImageUrlStub,
  } as unknown as ChallengeService
  const dataPortalService = {
    resetPortalImage: dataPortalServiceResetPortalImageStub,
  } as unknown as DataPortalService
  const removeNodesFacade = {
    removeFile: removeNodesFacadeRemoveFileStub,
  } as unknown as RemoveNodesFacade

  let referenceCreateStub: SinonStub

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(user).returns(user)

    findUnclosedFilesOrAssetsStub = stub(userFileHelper, 'findUnclosedFilesOrAssets')
    findFileOrAssetWithUidStub = stub(userFileHelper, 'findFileOrAssetWithUid')
    findFileOrAssetsWithDxidStub = stub(userFileHelper, 'findFileOrAssetsWithDxid')

    findUnclosedFilesOrAssetsStub.reset()
    findUnclosedFilesOrAssetsStub.throws()

    nodeHelperFindRecentClosingFilesAndAssetsStub.reset()
    nodeHelperFindRecentClosingFilesAndAssetsStub.throws()

    nodeHelperFindOldClosingFilesAndAssetsStub.reset()
    nodeHelperFindOldClosingFilesAndAssetsStub.throws()

    nodeHelperFindOldOpenFilesAndAssetsStub.reset()
    nodeHelperFindOldOpenFilesAndAssetsStub.throws()

    findFileOrAssetWithUidStub.reset()
    findFileOrAssetWithUidStub.throws()

    findFileOrAssetsWithDxidStub.reset()
    findFileOrAssetsWithDxidStub.throws()

    challengeServiceUpdateCardImageUrlStub.reset()
    challengeServiceUpdateCardImageUrlStub.throws()

    removeNodesFacadeRemoveFileStub.reset()
    removeNodesFacadeRemoveFileStub.throws()

    emFlushStub.reset()
    emFlushStub.throws()

    platformClientFileStatesStub.reset()
    platformClientFileStatesStub.throws()

    dataPortalServiceResetPortalImageStub.reset()
    dataPortalServiceResetPortalImageStub.resolves()

    mocksReset()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    findUnclosedFilesOrAssetsStub.restore()
    findFileOrAssetWithUidStub.restore()
    findFileOrAssetsWithDxidStub.restore()
  })

  function getInstance(): SyncFilesStateFacade {
    return new SyncFilesStateFacade(
      em,
      userCtx,
      platformClient,
      challengeService,
      dataPortalService,
      nodeHelper,
      removeNodesFacade,
    )
  }

  describe('#getBullJobId', () => {
    it('basic', () => {
      const bullJobId = SyncFilesStateFacade.getBullJobId('user-dxid')

      expect(bullJobId).to.eq(`${TASK_TYPE.SYNC_FILES_STATE}.${'user-dxid'}`)
    })
  })

  describe('#syncFiles', () => {
    it('all are closed', async () => {
      const file1 = {
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset
      const file2 = {
        uid: 'file2-dxid-1',
        dxid: 'file2-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset
      const file3 = {
        uid: 'file3-dxid-1',
        dxid: 'file3-dxid',
        project: 'project-2',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset

      nodeHelperFindRecentClosingFilesAndAssetsStub
        .onFirstCall()
        .resolves([file1, file2, file3])
        .onSecondCall()
        .resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file1.dxid, file2.dxid],
          projectDxid: file1.project,
        })
        .resolves([
          {
            id: file1.dxid,
            describe: {
              size: 10000,
              state: FILE_STATE_DX.CLOSED,
            },
          } as FileStateResult,
          {
            id: file2.dxid,
            describe: {
              size: 20000,
              state: FILE_STATE_DX.CLOSED,
            },
          } as FileStateResult,
        ])
      findFileOrAssetWithUidStub.withArgs(em, file1.uid).resolves(file1)
      findFileOrAssetWithUidStub.withArgs(em, file2.uid).resolves(file2)

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      expect(file1.fileSize).to.eq(10000)
      expect(file1.state).to.eq(FILE_STATE_DX.CLOSED)
      expect(file2.fileSize).to.eq(20000)
      expect(file2.state).to.eq(FILE_STATE_DX.CLOSED)
    })

    it('one closed, one open', async () => {
      const file1 = {
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset
      const file2 = {
        uid: 'file2-dxid-1',
        dxid: 'file2-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset

      nodeHelperFindRecentClosingFilesAndAssetsStub.onFirstCall().resolves([file1, file2]).onSecondCall().resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file1.dxid, file2.dxid],
          projectDxid: file1.project,
        })
        .resolves([
          {
            id: file1.dxid,
            describe: {
              size: 10000,
              state: FILE_STATE_DX.CLOSED,
            },
          } as FileStateResult,
          {
            id: file2.dxid,
            describe: {
              size: undefined,
              state: FILE_STATE_DX.OPEN,
            },
          } as FileStateResult,
        ])

      findFileOrAssetWithUidStub.withArgs(em, file1.uid).resolves(file1)
      findFileOrAssetWithUidStub.withArgs(em, file2.uid).resolves(file2)

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      expect(file1.fileSize).to.eq(10000)
      expect(file1.state).to.eq(FILE_STATE_DX.CLOSED)
      expect(file2.fileSize).to.eq(undefined)
      expect(file2.state).to.eq(FILE_STATE_DX.OPEN)
    })

    it('max count per run', async () => {
      const MAX_FILES_PER_RUN = 100

      const files: FileOrAsset[] = []
      for (let i = 0; i < MAX_FILES_PER_RUN + 10; i++) {
        files.push({
          uid: `file-dxid-${i}`,
          dxid: `file-dxid-${i}`,
          project: 'project-1',
          isCreatedByChallengeBot: () => false,
        } as unknown as FileOrAsset)
      }
      nodeHelperFindRecentClosingFilesAndAssetsStub.onFirstCall().resolves(files).onSecondCall().resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: files.slice(0, MAX_FILES_PER_RUN).map(f => f.dxid),
          projectDxid: 'project-1',
        })
        .resolves(
          files.slice(0, MAX_FILES_PER_RUN).map((f, index) => ({
            id: f.dxid,
            describe: {
              size: 10000 + index,
              state: FILE_STATE_DX.CLOSED,
            },
          })) as FileStateResult[],
        )
      files.slice(0, MAX_FILES_PER_RUN).forEach(file => {
        findFileOrAssetWithUidStub.withArgs(em, file.uid).resolves(file)
      })

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      for (let i = 0; i < MAX_FILES_PER_RUN; i++) {
        const file = files[i]
        expect(file.fileSize).to.eq(10000 + i)
        expect(file.state).to.eq(FILE_STATE_DX.CLOSED)
      }
      for (let i = MAX_FILES_PER_RUN; i < files.length; i++) {
        const file = files[i]
        expect(file.fileSize).to.be.undefined
        expect(file.state).to.be.undefined
      }
    })

    it('remove abandoned', async () => {
      const file1 = {
        id: 1,
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset

      nodeHelperFindRecentClosingFilesAndAssetsStub.onFirstCall().resolves([file1]).onSecondCall().resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file1.dxid],
          projectDxid: file1.project,
        })
        .resolves([])

      findFileOrAssetWithUidStub.withArgs(em, file1.uid).resolves(file1)
      findFileOrAssetsWithDxidStub.withArgs(em, file1.dxid).resolves([file1])
      removeNodesFacadeRemoveFileStub.reset()

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      expect(dataPortalServiceResetPortalImageStub.calledOnce).to.be.true()
      expect(dataPortalServiceResetPortalImageStub.firstCall.args[0]).to.deep.eq(file1.id)
      expect(removeNodesFacadeRemoveFileStub.calledOnce).to.be.true()
      expect(removeNodesFacadeRemoveFileStub.firstCall.firstArg).to.deep.eq(file1)
      expect(emFlushStub.calledOnce).to.be.true()
    })

    it('challenge bot file', async () => {
      const file1 = {
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => true,
      } as unknown as FileOrAsset

      nodeHelperFindRecentClosingFilesAndAssetsStub.onFirstCall().resolves([file1]).onSecondCall().resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file1.dxid],
          projectDxid: file1.project,
        })
        .resolves([
          {
            id: file1.dxid,
            describe: {
              size: 10000,
              state: FILE_STATE_DX.CLOSED,
            },
          } as FileStateResult,
        ])

      findFileOrAssetWithUidStub.withArgs(em, file1.uid).resolves(file1)
      challengeServiceUpdateCardImageUrlStub.withArgs(file1.uid).resolves()

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      expect(challengeServiceUpdateCardImageUrlStub.calledOnce).to.be.true()
      expect(challengeServiceUpdateCardImageUrlStub.firstCall.firstArg).to.equal(file1.uid)
    })

    it('remove abandoned files (open, closing)', async () => {
      const file1 = {
        id: 1,
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset
      const file2 = {
        id: 2,
        uid: 'file2-dxid-1',
        dxid: 'file2-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset

      nodeHelperFindRecentClosingFilesAndAssetsStub.resolves([])
      nodeHelperFindOldClosingFilesAndAssetsStub.resolves([file1])
      nodeHelperFindOldOpenFilesAndAssetsStub.resolves([file2])

      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file1.dxid],
          projectDxid: file1.project,
        })
        .resolves([])
      platformClientFileStatesStub
        .withArgs({
          fileDxids: [file2.dxid],
          projectDxid: file2.project,
        })
        .resolves([])

      findFileOrAssetsWithDxidStub.withArgs(em, file1.dxid).resolves([file1])
      findFileOrAssetsWithDxidStub.withArgs(em, file2.dxid).resolves([file2])
      removeNodesFacadeRemoveFileStub.reset()

      const facade = getInstance()
      await facade.syncFiles({} as unknown as Job)

      expect(dataPortalServiceResetPortalImageStub.callCount).to.eq(2)
      expect(dataPortalServiceResetPortalImageStub.getCall(0).args[0]).to.deep.eq(file1.id)
      expect(dataPortalServiceResetPortalImageStub.getCall(1).args[0]).to.deep.eq(file2.id)
      expect(removeNodesFacadeRemoveFileStub.callCount).to.eq(2)
      expect(removeNodesFacadeRemoveFileStub.getCall(0).args[0]).to.deep.eq(file1)
      expect(removeNodesFacadeRemoveFileStub.getCall(1).args[0]).to.deep.eq(file2)
    })
  })
})
