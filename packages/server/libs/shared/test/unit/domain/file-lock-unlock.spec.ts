import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { FileLockOperation } from '@shared/domain/user-file/ops/file-lock'
import { FileUnlockOperation } from '@shared/domain/user-file/ops/file-unlock'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { expect } from 'chai'
import pino from 'pino'
import { create, db } from '../../../src/test'

describe('lock/unlock file tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
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

    const op = new FileLockOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    await op.execute([{ id: secondFile.id }])
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

    const op = new FileLockOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    await op.execute([{ id: secondFile.id }])
    await op.execute([{ id: firstFile.id }])
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

    const op = new FileUnlockOperation({
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
