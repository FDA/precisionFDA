import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { TASK_TYPE } from '@shared/queue/task.input'
import { expect } from 'chai'
import { Job } from 'bull'
import { User } from '@shared/domain/user/user.entity'
import { SinonStub, stub } from 'sinon'
import { Reference } from '@mikro-orm/core'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { FILE_STATE_DX, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { FileStateResult } from '@shared/platform-client/platform-client.responses'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { Challenge } from '@shared/domain/challenge/challenge.entity'

describe('SyncFilesStateFacade', () => {
  const user = {
    id: 10,
    dxuser: 'dxuser',
  } as unknown as User

  const platformClientFileStatesStub = stub()
  const challengeRepoFindOneWithCardImageUidStub = stub()
  const emFlushStub = stub()
  const emGetRepositoryStub = stub()
  const removeNodesFacadeRemoveFileStub = stub()

  let findUnclosedFilesOrAssetsStub: SinonStub
  let findFileOrAssetWithUidStub: SinonStub
  let findFileOrAssetsWithDxidStub: SinonStub

  const em = {
    flush: emFlushStub,
    getRepository: emGetRepositoryStub,
  } as unknown as SqlEntityManager
  const userCtx = {
    dxuser: user.dxuser,
    async loadEntity(): Promise<User> {
      return user
    },
  } as unknown as UserContext
  const platformClient = {
    fileStates: platformClientFileStatesStub,
  } as unknown as PlatformClient
  const challengeRepo = {
    findOneWithCardImageUid: challengeRepoFindOneWithCardImageUidStub,
  } as unknown as ChallengeRepository
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

    findFileOrAssetWithUidStub.reset()
    findFileOrAssetWithUidStub.throws()

    findFileOrAssetsWithDxidStub.reset()
    findFileOrAssetsWithDxidStub.throws()

    challengeRepoFindOneWithCardImageUidStub.reset()
    challengeRepoFindOneWithCardImageUidStub.throws()

    removeNodesFacadeRemoveFileStub.reset()
    removeNodesFacadeRemoveFileStub.throws()

    emFlushStub.reset()
    emFlushStub.throws()

    emGetRepositoryStub.reset()
    emGetRepositoryStub.throws()

    platformClientFileStatesStub.reset()
    platformClientFileStatesStub.throws()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    findUnclosedFilesOrAssetsStub.restore()
    findFileOrAssetWithUidStub.restore()
    findFileOrAssetsWithDxidStub.restore()
  })

  function getInstance(): SyncFilesStateFacade {
    return new SyncFilesStateFacade(em, userCtx, platformClient, challengeRepo, removeNodesFacade)
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

      findUnclosedFilesOrAssetsStub
        .withArgs(em, user.id)
        .onFirstCall()
        .resolves([file1, file2, file3])
        .onSecondCall()
        .resolves([])
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

      findUnclosedFilesOrAssetsStub
        .withArgs(em, user.id)
        .onFirstCall()
        .resolves([file1, file2])
        .onSecondCall()
        .resolves([])
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
      findUnclosedFilesOrAssetsStub
        .withArgs(em, user.id)
        .onFirstCall()
        .resolves(files)
        .onSecondCall()
        .resolves([])
      platformClientFileStatesStub
        .withArgs({
          fileDxids: files.slice(0, MAX_FILES_PER_RUN).map((f) => f.dxid),
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
      files.slice(0, MAX_FILES_PER_RUN).forEach((file) => {
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
        uid: 'file1-dxid-1',
        dxid: 'file1-dxid',
        project: 'project-1',
        isCreatedByChallengeBot: () => false,
      } as unknown as FileOrAsset

      findUnclosedFilesOrAssetsStub
        .withArgs(em, user.id)
        .onFirstCall()
        .resolves([file1])
        .onSecondCall()
        .resolves([])
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

      findUnclosedFilesOrAssetsStub
        .withArgs(em, user.id)
        .onFirstCall()
        .resolves([file1])
        .onSecondCall()
        .resolves([])
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

      const challenge = {} as unknown as Challenge

      findFileOrAssetWithUidStub.withArgs(em, file1.uid).resolves(file1)
      findFileOrAssetsWithDxidStub.withArgs(em, file1.dxid).resolves([file1])
      challengeRepoFindOneWithCardImageUidStub.withArgs(file1.uid).resolves(challenge)
      emGetRepositoryStub.reset()

      const job = {} as unknown as Job

      const facade = getInstance()
      await facade.syncFiles(job)

      // here I only want to know if the ChallengeUpdateCardImageUrlOperation was called
      // it needs to be moved into it's separate service and therefore it doesn't make much
      // sense to test calling the inside of the operation
      expect(emGetRepositoryStub.calledOnce).to.be.true()
    })
  })
})
