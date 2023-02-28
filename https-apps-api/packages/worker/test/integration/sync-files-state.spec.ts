/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import { EntityManager } from '@mikro-orm/mysql'
import { database, queue, errors, client } from '@pfda/https-apps-shared'
import { User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import {
  FILE_STATE,
  FILE_STATE_DX,
  IFileOrAsset,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { Asset, SyncFilesStateOperation } from '@pfda/https-apps-shared/src/domain/user-file'
import { UserCtx } from '@pfda/https-apps-shared/src/types'
import { FileStatesParams } from '@pfda/https-apps-shared/src/platform-client/platform-client.params'
import R from 'ramda'
import { findFileOrAssetWithUid } from '@pfda/https-apps-shared/src/domain/user-file/user-file.helper'
import { fakes as localFakes, mocksReset as localMocksReset } from '../utils/mocks'
import { errorsFactory } from '../utils/errors-factory'


describe('SyncFilesStateOperation static methods', () => {
  it('creates correct bullJob ids', async () => {
    const dxuser = 'joe.user'
    const bullJobId = SyncFilesStateOperation.getBullJobId(dxuser)
    expect(bullJobId).to.equal('sync_files_state.joe.user')
  })
})

// Adding the task directly to the queue instead of using queue.createSyncFilesStateTask
// as that function adds a repeatble job and won't be run during the test
const createSyncFilesStateTask = async (user: UserCtx) => {
  const defaultTestQueue = queue.getStatusQueue()
  // .add() is stubbed
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.SYNC_FILES_STATE,
    user,
  })
}

describe('TASK: sync-files-states (SyncFilesStateOperation)', () => {
  let em: EntityManager
  let user1: User
  let user1Ctx: UserCtx
  let user2: User
  let user2Ctx: UserCtx
  let botUser: User
  let botUserCtx: UserCtx
  let files: UserFile[]
  let assets: Asset[]
  let filesAndAssets: IFileOrAsset[]

  const FILE_SIZE = '65535'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user1 = create.userHelper.create(em, { email: generate.random.email() })
    user2 = create.userHelper.create(em, { email: generate.random.email() })
    botUser = create.userHelper.createChallengeBot(em)
    await em.flush()

    user1Ctx = { id: user1.id, dxuser: user1.dxuser, accessToken: 'foo1' }
    user2Ctx = { id: user2.id, dxuser: user2.dxuser, accessToken: 'foo2' }
    botUserCtx = { id: botUser.id, dxuser: botUser.dxuser, accessToken: create.userHelper.getChallengeBotToken() }

    const filesParams = (userId: number, state: FILE_STATE) => ({
      parentId: userId,
      parentType: PARENT_TYPE.USER,
      state,
    })
    const openFilesParams = (userId: number) => filesParams(userId, FILE_STATE_DX.OPEN)
    const closingFilesParams = (userId: number) => filesParams(userId, FILE_STATE_DX.CLOSING)
    const closedFilesParams = (userId: number) => filesParams(userId, FILE_STATE_DX.CLOSED)

    // Just to shorten the lines
    const createFile = create.filesHelper.create
    files = [
      // user1
      createFile(em, { user: user1 }, { name: 'user1_file1', ...openFilesParams(user1.id) }),
      createFile(em, { user: user1 }, { name: 'user1_file2', ...closingFilesParams(user1.id) }),
      createFile(em, { user: user1 }, { name: 'user1_file3', ...closedFilesParams(user1.id) }),
      createFile(em, { user: user1 }, { name: 'user1_file4', ...closingFilesParams(user1.id) }),
      // user2
      createFile(em, { user: user2 }, { name: 'user2_file1', ...openFilesParams(user2.id) }),
      createFile(em, { user: user2 }, { name: 'user2_file2', ...closingFilesParams(user2.id) }),
      createFile(em, { user: user2 }, { name: 'user2_file3', ...closedFilesParams(user2.id) }),
      createFile(em, { user: user2 }, { name: 'user2_file4', ...closedFilesParams(user2.id) }),
    ]

    const createAsset = create.filesHelper.createUploadedAsset
    assets = [
      // user1
      createAsset(em, { user: user1 }, { name: 'user1_asset1', ...openFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset2', ...closingFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset3', ...closedFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset4', ...closingFilesParams(user1.id) }),
      // user2
      createAsset(em, { user: user2 }, { name: 'user2_asset1', ...openFilesParams(user2.id) }),
      createAsset(em, { user: user2 }, { name: 'user2_asset2', ...closingFilesParams(user2.id) }),
      createAsset(em, { user: user2 }, { name: 'user2_asset3', ...closedFilesParams(user2.id) }),
      createAsset(em, { user: user2 }, { name: 'user2_asset4', ...closedFilesParams(user2.id) }),
    ]
    await em.flush()

    filesAndAssets = (files as IFileOrAsset[]).concat(assets)

    // reset fakes
    mocksReset()
    localMocksReset()
  })

  it('syncs files and assets state changes for user1', async () => {
    const filesToClose = filesAndAssets.filter(f => {
      return f.user.getEntity().id === user1.id && f.state !== FILE_STATE_DX.CLOSED
    })
    const untouchedFiles = R.difference(files, filesToClose)

    // console.log(filesToClose.map(f => f.name))
    // console.log(untouchedFiles.map(f => f.name))

    // Fake all pending files are closed
    fakes.client.fileStatesFake.callsFake((params: FileStatesParams) => {
      return params.fileDxids.map(fileDxid => ({
        id: fileDxid,
        describe: {
          size: FILE_SIZE,
          state: FILE_STATE_DX.CLOSED,
        },
      }))
    })

    await createSyncFilesStateTask(user1Ctx)
    expect(localFakes.addToQueueStub.calledOnce).to.be.true()


    // N.B. must use forked EntityManager to be able to retrieve
    //      changes made inside the operation
    const afterEm = em.fork()
    const uidsToClose = filesToClose.map(f => f.uid)
    // console.log("uidsToClose")
    // console.log(uidsToClose)

    for (const uid of uidsToClose) {
      const fileOrAsset: IFileOrAsset = await findFileOrAssetWithUid(afterEm, uid)
      expect(fileOrAsset.state, `expecting file ${fileOrAsset.name} to be closed`).to.equal(FILE_STATE_DX.CLOSED)
      expect(fileOrAsset.fileSize, `expecting file ${fileOrAsset.name} to have size`).to.equal(FILE_SIZE)
    }

    const untouchedFilesUids = untouchedFiles.map(f => f.uid)
    for (const uid of untouchedFilesUids) {
      const fileOrAsset: IFileOrAsset = await findFileOrAssetWithUid(afterEm, uid)
      const originalFile = untouchedFiles.find(f => uid === f.uid)
      expect(fileOrAsset.state, `expecting file ${fileOrAsset.name} to be unchanged`).to.equal(originalFile.state)
    }

    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
  })

  it('syncs files for user2 but does not remove the repeatble job if unclosed files remain', async () => {
    // Only close user2's file and asset in closing state, leaving alone user2's file in open state
    const filesToClose = filesAndAssets.filter(f => {
      return f.user.getEntity().id === user2.id && f.state === FILE_STATE_DX.CLOSING
    })
    const untouchedFiles = R.difference(files, filesToClose)

    const filesToCloseDxid = filesToClose.map(f => f.dxid)

    // Fake all pending files are closed
    fakes.client.fileStatesFake.callsFake((params: FileStatesParams) => {
      return params.fileDxids.map(fileDxid => {
        return filesToCloseDxid.includes(fileDxid) ? {
          id: fileDxid,
          describe: {
            size: FILE_SIZE,
            state: FILE_STATE_DX.CLOSED,
          },
        } : {
          id: fileDxid,
          describe: {
            size: FILE_SIZE,
            state: FILE_STATE_DX.OPEN,
          },
        }
      })
    })

    await createSyncFilesStateTask(user2Ctx)
    expect(localFakes.addToQueueStub.calledOnce).to.be.true()

    // N.B. must use forked EntityManager to be able to retrieve
    //      changes made inside the operation
    const afterEm = em.fork()
    const uidsToClose = filesToClose.map(f => f.uid)

    for (const uid of uidsToClose) {
      const fileOrAsset: IFileOrAsset = await findFileOrAssetWithUid(afterEm, uid)
      expect(fileOrAsset.state, `expecting file ${fileOrAsset.name} to be closed`).to.equal(FILE_STATE_DX.CLOSED)
      expect(fileOrAsset.fileSize, `expecting file ${fileOrAsset.name} to have size`).to.equal(FILE_SIZE)
    }

    const untouchedFilesUids = untouchedFiles.map(f => f.uid)
    for (const uid of untouchedFilesUids) {
      const fileOrAsset: IFileOrAsset = await findFileOrAssetWithUid(afterEm, uid)
      const originalFile = untouchedFiles.find(f => uid === f.uid)
      expect(fileOrAsset.state, `expecting file ${fileOrAsset.name} to be unchanged`).to.equal(originalFile.state)
    }

    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.false()
  })

  it('does not call platform if user does not exist', async () => {
    const dxuser = 'no-such-user'
    const userCtx = { id: 555, dxuser, accessToken: 'foo1' }
    await createSyncFilesStateTask(userCtx)
    expect(localFakes.addToQueueStub.calledOnce).to.be.true()
    expect(fakes.client.fileStatesFake.callCount).to.equal(0)
  })

  it('it handles InvalidAuthentication - ExpiredToken gracefully', async () => {
    fakes.client.fileStatesFake.rejects(errorsFactory.createClientTokenExpiredError())

    await createSyncFilesStateTask(user1Ctx)
    expect(fakes.client.fileStatesFake.calledOnce).to.be.true()
    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
  })

  it('it handles ClientRequestError gracefully', async () => {
    fakes.client.fileStatesFake.rejects(errorsFactory.createServiceUnavailableError())

    await createSyncFilesStateTask(user1Ctx)
    expect(fakes.client.fileStatesFake.calledOnce).to.be.true()
    expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
  })
})
