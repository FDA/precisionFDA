import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import pino from 'pino'
import { mocksReset } from '../../../mocks'
import { User, userFile, Folder } from '../../../../domain'
import { mocksReset as localMocksReset } from '../../../../../../worker/test/utils/mocks'
import { create, db } from 'shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'

describe('lock/unlock folder tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    mocksReset()
    localMocksReset()
  })

  it('test remove folder', async () => {
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1', locked: false })
    await em.flush()

    const op = new userFile.FolderLockOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ id: folder1.id })
    em.clear()

    const loadedFolder1 = await em.findOne(Folder, { id: folder1.id })
    expect(loadedFolder1?.locked).to.equal(true)
  })
  it('test mixed folders - lock operation', async () => {
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1', locked: false })
    const folder2 = create.filesHelper.createFolder(em, { user }, { name: 'folder2', locked: true })
    await em.flush()

    const op = new userFile.FolderLockOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ id: folder1.id })
    await op.execute({ id: folder2.id })
    em.clear()
    const loadedFolder1 = await em.findOne(Folder, { id: folder1.id })
    expect(loadedFolder1?.locked).to.equal(true)
    const loadedFolder2 = await em.findOne(Folder, { id: folder2.id })
    expect(loadedFolder2?.locked).to.equal(true)
  })
  it('test mixed folders - unlock operation', async () => {
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1', locked: false })
    const folder2 = create.filesHelper.createFolder(em, { user }, { name: 'folder2', locked: true })
    await em.flush()

    const op = new userFile.FolderUnlockOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ id: folder1.id })
    await op.execute({ id: folder2.id })
    em.clear()
    const loadedFolder1 = await em.findOne(Folder, { id: folder1.id })
    expect(loadedFolder1?.locked).to.equal(false)
    const loadedFolder2 = await em.findOne(Folder, { id: folder2.id })
    expect(loadedFolder2?.locked).to.equal(false)
  })
})
