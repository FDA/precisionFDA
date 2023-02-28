import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import pino from 'pino'
import { mocksReset } from '../../../mocks'
import { User, UserFile, userFile } from '../../../../domain'
import { mocksReset as localMocksReset } from '../../../../../../worker/test/utils/mocks'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'

describe('lock/unlock file tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    mocksReset()
    localMocksReset()
  })

  it('test lock file', async () => {
    const dxid = 'file--ABCD'
    const firstFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file1', dxid, uid: `${dxid}-1`, locked: false },
    )
    const secondFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file2', dxid, uid: `${dxid}-2`, locked: false },
    )
    await em.flush()

    const op = new userFile.FileLockOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    await op.execute({ id: secondFile.id })
    em.clear()
    const loadedFirstFile = await em.findOneOrFail(UserFile, { id: firstFile.id })
    expect(loadedFirstFile.locked).to.not.equal(true)

    const loadedSecondFile = await em.findOne(UserFile, { id: secondFile.id })
    expect(loadedSecondFile?.locked).to.equal(true)
  })

  it('test mixed files - lock operation', async () => {
    const dxid = 'file--ABCD'
    const firstFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file1', dxid, uid: `${dxid}-1`, locked: true },
    )
    const secondFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file2', dxid, uid: `${dxid}-2`, locked: false },
    )
    await em.flush()

    const op = new userFile.FileLockOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    await op.execute({ id: secondFile.id })
    await op.execute({ id: firstFile.id })
    em.clear()
    const loadedFirstFile = await em.findOneOrFail(UserFile, { id: firstFile.id })
    expect(loadedFirstFile.locked).to.equal(true)

    const loadedSecondFile = await em.findOne(UserFile, { id: secondFile.id })
    expect(loadedSecondFile?.locked).to.equal(true)
  })
  it('test mixed files - unlock operation', async () => {
    const dxid = 'file--ABCD'
    const firstFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file1', dxid, uid: `${dxid}-1`, locked: true },
    )
    const secondFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file2', dxid, uid: `${dxid}-2`, locked: false },
    )
    await em.flush()

    const op = new userFile.FileUnlockOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    await op.execute({ id: secondFile.id })
    await op.execute({ id: firstFile.id })
    em.clear()
    const loadedFirstFile = await em.findOneOrFail(UserFile, { id: firstFile.id })
    expect(loadedFirstFile.locked).to.equal(false)

    const loadedSecondFile = await em.findOne(UserFile, { id: secondFile.id })
    expect(loadedSecondFile?.locked).to.equal(false)
  })
})
