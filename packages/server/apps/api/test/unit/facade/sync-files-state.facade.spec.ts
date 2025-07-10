import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { TASK_TYPE } from '@shared/queue/task.input'
import { expect } from 'chai'
import { Job } from 'bull'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SinonStub, stub } from 'sinon'
import { Reference } from '@mikro-orm/core'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { FILE_STATE_DX, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { FileStateResult } from '@shared/platform-client/platform-client.responses'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'

describe('SyncFilesStateFacade', () => {
  const user = {
    id: 10,
    dxuser: 'dxuser',
  } as unknown as User

  const userRepoFindOneStub = stub()
  const platformClientFileStatesStub = stub()
  const challengeRepoFindOneWithCardImageUidStub = stub()
  const emFlushStub = stub()
  let findUnclosedFilesOrAssetsStub: SinonStub
  let findFileOrAssetWithUidStub: SinonStub

  const em = {
    flush: emFlushStub,
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
  const userRepo = {
    findOne: userRepoFindOneStub,
  } as unknown as UserRepository
  const challengeRepo = {
    findOneWithCardImageUid: challengeRepoFindOneWithCardImageUidStub,
  } as unknown as ChallengeRepository
  const removeNodesFacade = {} as unknown as RemoveNodesFacade

  let referenceCreateStub: SinonStub

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(user).returns(user)

    findUnclosedFilesOrAssetsStub = stub(userFileHelper, 'findUnclosedFilesOrAssets')
    findFileOrAssetWithUidStub = stub(userFileHelper, 'findFileOrAssetWithUid')

    findUnclosedFilesOrAssetsStub.reset()
    findUnclosedFilesOrAssetsStub.throws()

    findFileOrAssetWithUidStub.reset()
    findFileOrAssetWithUidStub.throws()

    userRepoFindOneStub.reset()
    userRepoFindOneStub.throws()

    challengeRepoFindOneWithCardImageUidStub.reset()
    challengeRepoFindOneWithCardImageUidStub.throws()

    emFlushStub.reset()
    emFlushStub.throws()

    platformClientFileStatesStub.reset()
    platformClientFileStatesStub.throws()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    findUnclosedFilesOrAssetsStub.restore()
    findFileOrAssetWithUidStub.restore()
  })

  function getInstance(): SyncFilesStateFacade {
    return new SyncFilesStateFacade(em, userCtx, platformClient, userRepo, challengeRepo, removeNodesFacade)
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
      } as unknown as FileOrAsset
      const file2 = {
        uid: 'file2-dxid-1',
        dxid: 'file2-dxid',
        project: 'project-1',
      } as unknown as FileOrAsset
      const file3 = {
        uid: 'file3-dxid-1',
        dxid: 'file3-dxid',
        project: 'project-2',
      } as unknown as FileOrAsset

      userRepoFindOneStub.withArgs({ dxuser: user.dxuser }).resolves(user)
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

      expect
    })

    // some are not closed
    // remove abandoned
    // challengebot file
  })
})
