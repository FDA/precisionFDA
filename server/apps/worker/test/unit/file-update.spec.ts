import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { FileUpdateOperation } from '@shared/domain/user-file/ops/file-update'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { expect } from 'chai'
import { create, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { UserCtx } from '@shared/types'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'

describe('FileUpdateOperation tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let log: any
  let file: UserFile
  let asset: Asset

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()

    userCtx = { id: user.id, dxuser: user.dxuser, accessToken: 'foo1' }

    file = create.filesHelper.create(em, { user })
    asset = create.filesHelper.createUploadedAsset(em, { user })
    await em.flush()

    // reset fakes
    mocksReset()
  })

  it('syncs a file that is closed on platform', async () => {
    const op = new FileUpdateOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const fileSize = 12345
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: file.dxid,
      name: file.name,
      size: fileSize,
      state: FILE_STATE_DX.CLOSED,
    }))
    const fileOrAsset = await op.execute({ uid: file.uid })

    expect(fakes.client.fileDescribeFake.callCount).to.equal(1)
    expect(fileOrAsset.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(fileOrAsset.fileSize).to.equal(fileSize)
  })

  it('syncs an asset that is closed on platform', async () => {
    const op = new FileUpdateOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const fileSize = 12345
    fakes.client.fileDescribeFake.callsFake(() => ({
      id: asset.dxid,
      name: asset.name,
      size: fileSize,
      state: FILE_STATE_DX.CLOSED,
    }))
    const fileOrAsset = await op.execute({ uid: asset.uid })

    expect(fakes.client.fileDescribeFake.callCount).to.equal(1)
    expect(fileOrAsset.state).to.equal(FILE_STATE_DX.CLOSED)
    expect(fileOrAsset.fileSize).to.equal(fileSize)
  })

  it('syncs a file that is not closed on platform', async () => {
    const op = new FileUpdateOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    fakes.client.fileDescribeFake.callsFake(() => ({
      id: asset.dxid,
      name: asset.name,
      // N.B. size is not returned by platform is file is not closed
      state: FILE_STATE_DX.OPEN,
    }))
    const fileOrAsset = await op.execute({ uid: asset.uid })

    expect(fakes.client.fileDescribeFake.callCount).to.equal(1)
    expect(fileOrAsset.state).to.equal(FILE_STATE_DX.OPEN)
    expect(fileOrAsset.fileSize).to.equal(undefined)
  })

  it('throws exception if file uid is not found', async () => {
    const op = new FileUpdateOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    fakes.client.fileDescribeFake.callsFake(() => ({
      id: asset.dxid,
      name: asset.name,
      size: 123,
      state: FILE_STATE_DX.CLOSED,
    }))

    const execute = async () => {
      await op.execute({ uid: 'no-such-uid' })
    }
    await expect(execute()).to.eventually.be
      .rejectedWith('File or asset with uid no-such-uid not found')
    expect(fakes.client.fileDescribeFake.callCount).to.equal(0)
  })
})
