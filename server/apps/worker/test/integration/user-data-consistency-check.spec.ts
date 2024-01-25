/* eslint-disable max-len */
import { config } from '@shared/config'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import {
  UserDataConsistencyReportOperation
} from '@shared/domain/user/ops/user-data-consistency-report'
import { User } from '@shared/domain/user/user.entity'
/* eslint-disable no-inline-comments */
/* eslint-disable no-undefined */
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { UserCtx } from '@shared/types'
import { create, generate, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { MySqlDriver } from '@mikro-orm/mysql'
import { FILE_STATE, FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'


describe('TASK: UserDataConsistencyReportOperation', () => {
  let em: EntityManager<MySqlDriver>
  let user1: User
  let botUser: User
  let user1Ctx: UserCtx
  let botUserCtx: UserCtx
  let files: UserFile[]
  let assets: Asset[]
  let httpsApp: App
  let normalApp: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user1 = create.userHelper.create(em, { email: generate.random.email() })
    botUser = create.userHelper.createChallengeBot(em)
    await em.flush()

    user1Ctx = { id: user1.id, dxuser: user1.dxuser, accessToken: 'foo1' }
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
    ]

    const createAsset = create.filesHelper.createUploadedAsset
    assets = [
      // user1
      createAsset(em, { user: user1 }, { name: 'user1_asset1', ...openFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset2', ...closingFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset3', ...closedFilesParams(user1.id) }),
      createAsset(em, { user: user1 }, { name: 'user1_asset4', ...closingFilesParams(user1.id) }),
    ]

    httpsApp = create.appHelper.createHTTPS(em, { user: user1 })
    normalApp = create.appHelper.createRegular(em, { user: user1 })
    await em.flush()
    mocksReset()
    queueMocksReset()
  })

  it('doesUserNeedFullCheckup returns true if it has not been run before', async () => {
    user1.lastDataCheckup = null
    em.flush()
    expect(UserDataConsistencyReportOperation.doesUserNeedFullCheckup(user1)).to.equal(true)
  })

  it('doesUserNeedFullCheckup returns true if checkup is overdue', async () => {
    const repeatMilliseconds = config.workerJobs.userDataConsistencyReport.repeatSeconds * 1000
    user1.lastDataCheckup = new Date(new Date().getTime() - repeatMilliseconds - 100)
    em.flush()
    expect(UserDataConsistencyReportOperation.doesUserNeedFullCheckup(user1)).to.equal(true)
  })

  it('doesUserNeedFullCheckup returns true if checkup is before due date', async () => {
    const repeatMilliseconds = config.workerJobs.userDataConsistencyReport.repeatSeconds * 1000
    user1.lastDataCheckup = new Date(new Date().getTime() - repeatMilliseconds + 100)
    em.flush()
    expect(UserDataConsistencyReportOperation.doesUserNeedFullCheckup(user1)).to.equal(false)
  })

  it('enqueues correctly', async () => {
    fakes.client.userDescribeFake.callsFake(() => ({
      email: 'hello@world.org',
    }))

    await UserDataConsistencyReportOperation.enqueue(user1Ctx)
    expect(queueFakes.addToQueueStub.callCount).to.equal(1)
  })
})
