/* eslint-disable max-len */
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { Asset, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { database, errors } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'
import { FILE_STATE, FILE_STATE_DX, PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { AbstractSqlDriver } from '@mikro-orm/mysql'
import { FileCloseParams } from '@pfda/https-apps-shared/src/platform-client/platform-client.params'
import { SyncFilesStateOperation } from '@pfda/https-apps-shared/src/domain/user-file'


describe('PATCH /files/:id/close', () => {
  let em: EntityManager<AbstractSqlDriver>
  let user1: User
  let user2: User
  let challengeBotUser: User
  let userCtx1: UserCtx
  let userCtx2: UserCtx
  let challengeBotUserCtx: UserCtx
  let files: UserFile[]
  let assets: Asset[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    challengeBotUser = create.userHelper.createChallengeBot(em)
    await em.flush()

    userCtx1 = { id: user1.id, dxuser: user1.dxuser, accessToken: 'fake-token' }
    userCtx2 = { id: user2.id, dxuser: user2.dxuser, accessToken: 'fake-token' }
    challengeBotUserCtx = {
      id: challengeBotUser.id,
      dxuser: challengeBotUser.dxuser,
      accessToken: create.userHelper.getChallengeBotToken(),
    }

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
    mocksReset()
  })

  it('closes file for user1 and adds FilesStateSync task', async () => {
    const user = user1
    const file = files[0]

    // To rework and remove after async notifications is merged
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: file.dxid,
      name: file.name,
      size: 12345,
      state: FILE_STATE_DX.CLOSED,
    }))

    const res = await supertest(getServer())
      .patch(`/files/${file.uid}/close`)
      .query({ ...getDefaultQueryData(user) })

    // console.log(res)
    expect(res.statusCode).to.equal(200)

    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(file.dxid)

    expect(fakes.queue.findRepeatableFake.callCount).to.equal(1)
    expect(fakes.queue.findRepeatableFake.getCall(0).args[0])
      .to.equal(`sync_files_state.${user1.dxuser}`)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
  })

  it('closes file for user2 and adds FilesStateSync task, while a task exists for user1', async () => {
    const user = user2
    const file = files[4]

    // Insert existing queue jobs for user1, but should not affect user2
    const bullJobsInQueue = [
      generate.bullQueueRepeatable.syncFilesState(user1.dxuser),
    ]
    fakes.queue.findRepeatableFake.callsFake((bullJobId: string): object | undefined => {
      const match = bullJobsInQueue.filter((job => job.id === bullJobId))
      // eslint-disable-next-line no-undefined
      return (match.length > 0) ? match[0] : undefined
    })

    // To rework and remove after async notifications is merged
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: file.dxid,
      name: file.name,
      size: 12345,
      state: FILE_STATE_DX.CLOSED,
    }))

    const res = await supertest(getServer())
      .patch(`/files/${file.uid}/close`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)

    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(file.dxid)

    expect(fakes.queue.findRepeatableFake.callCount).to.equal(1)
    expect(fakes.queue.findRepeatableFake.getCall(0).args[0])
      .to.equal(`sync_files_state.${user2.dxuser}`)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
    const createCall = fakes.queue.createSyncFilesStateTask.getCall(0).args[0]
    expect(createCall).to.deep.equal(userCtx2)
  })

  it('closes file for user1 but does not add FilesStateSync task if it already exists', async () => {
    const user = user1
    const file = files[0]

    // Insert existing queue jobs
    const bullJobsInQueue = [
      generate.bullQueue.syncFilesState(userCtx1),
    ]
    fakes.queue.findRepeatableFake.callsFake((bullJobId: string): object | undefined => {
      const match = bullJobsInQueue.filter((job => SyncFilesStateOperation.getBullJobId(user.dxuser) === bullJobId))
      return match.length > 0 ? match[0] : undefined
    })

    // To rework and remove after async notifications is merged
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: file.dxid,
      name: file.name,
      size: 12345,
      state: FILE_STATE_DX.CLOSED,
    }))

    const res = await supertest(getServer())
      .patch(`/files/${file.uid}/close`)
      .query({ ...getDefaultQueryData(user) })

    expect(res.statusCode).to.equal(200)
    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(file.dxid)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })

  it('has no effect if file is in closing state', async () => {
    const file = files[1]
    fakes.client.fileCloseFake.returns({
      id: file.dxid,
      message: 'File is in cloooosed state',
    })

    const res = await supertest(getServer())
      .patch(`/files/${file.uid}/close`)
      .query({ ...getDefaultQueryData(user1) })
      .expect(200)

    expect(res.body).to.have.property('message', 'File is already in closing state')

    expect(fakes.client.fileCloseFake.callCount).to.equal(0)
    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })

  it('has no effect if file is in closed state', async () => {
    const file = files[2]
    fakes.client.fileCloseFake.returns({
      id: file.dxid,
      message: 'File is in cloooosed state',
    })

    const res = await supertest(getServer())
      .patch(`/files/${file.uid}/close`)
      .query({ ...getDefaultQueryData(user1) })
      .expect(200)

    expect(res.body).to.have.property('message', 'File is already closed')

    expect(fakes.client.fileCloseFake.callCount).to.equal(0)
    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })

  it('closes asset for user1', async () => {
    const user = user1
    const asset = assets[0]

    // To rework and remove after async notifications is merged
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: asset.dxid,
      name: asset.name,
      size: 12345,
      state: FILE_STATE_DX.CLOSED,
    }))

    const res = await supertest(getServer())
      .patch(`/files/${asset.uid}/close`)
      .query({ ...getDefaultQueryData(user) })

    // console.log(res)
    expect(res.statusCode).to.equal(200)

    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(asset.dxid)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
  })

  it('closes challenge bot file if user is site admin', async () => {
    const challengeBotFile = create.filesHelper.createUploaded(
      em,
      { user: challengeBotUser },
      { state: FILE_STATE_DX.OPEN },
    )
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    await em.flush()

    const res = await supertest(getServer())
      .patch(`/files/${challengeBotFile.uid}/close`)
      .query({ ...getDefaultQueryData(siteAdmin) })
      .expect(200)

    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(challengeBotFile.dxid)

    // To guard for the case where the code checks for the wrong user's file sync task
    expect(fakes.queue.findRepeatableFake.callCount).to.equal(1)
    expect(fakes.queue.findRepeatableFake.getCall(0).args[0])
      .to.equal('sync_files_state.challenge-bot-test')

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
    const createCall = fakes.queue.createSyncFilesStateTask.getCall(0).args[0]
    expect(createCall).to.deep.equal(challengeBotUserCtx)
  })

  it('closes challenge bot file if user is challenge admin', async () => {
    const challengeBotFile = create.filesHelper.createUploaded(
      em,
      { user: challengeBotUser },
      { state: FILE_STATE_DX.OPEN },
    )
    const challengeAdmin = create.userHelper.createChallengeAdmin(em)
    await em.flush()

    const res = await supertest(getServer())
      .patch(`/files/${challengeBotFile.uid}/close`)
      .query({ ...getDefaultQueryData(challengeAdmin) })
      .expect(200)

    expect(fakes.client.fileCloseFake.calledOnce).to.be.true()
    const call = fakes.client.fileCloseFake.getCall(0).args[0] as FileCloseParams
    expect(call.fileDxid).to.equal(challengeBotFile.dxid)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
    const createCall = fakes.queue.createSyncFilesStateTask.getCall(0).args[0]
    expect(createCall).to.deep.equal(challengeBotUserCtx)
  })

  it('throws error if non site or challenge admin tries to close challenge bot file', async () => {
    const challengeBotFile = create.filesHelper.createUploaded(
      em,
      { user: challengeBotUser },
      { state: FILE_STATE_DX.OPEN },
    )
    await em.flush()

    await supertest(getServer())
      .patch(`/files/${challengeBotFile.uid}/close`)
      .query({ ...getDefaultQueryData(user1) })
      .expect(403)
  })

  it("returns 403 if user2 tries to close another user's file", async () => {
    const res = await supertest(getServer())
      .patch(`/files/${files[0].uid}/close`)
      .query({ ...getDefaultQueryData(user2) })
      .expect(403)

    expect(res.body.error).to.have.property('code', errors.ErrorCodes.NOT_PERMITTED)
    expect(fakes.client.fileCloseFake.callCount).to.equal(0)
    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })

  it('returns 404 when file does not exist', async () => {
    const fileUid = 'file-no-such-file-1'
    const res = await supertest(getServer())
      .patch(`/files/${fileUid}/close`)
      .query({ ...getDefaultQueryData(user2) })
      .expect(404)

    expect(res.body.error).to.have.property('code', errors.ErrorCodes.USER_FILE_NOT_FOUND)
    expect(fakes.client.fileCloseFake.callCount).to.equal(0)
    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })
})
