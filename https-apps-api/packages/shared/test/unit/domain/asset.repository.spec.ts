/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { Asset, User } from '../../../src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { FILE_STATE_DX } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'

describe('AssetRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  // let log: any
  let user1: User
  let user2: User
  let assets: Asset[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    // log = getLogger()
    await em.flush()

    assets = [
      // user1
      create.filesHelper.createUploadedAsset(em, { user: user1 }, { name: 'user1_asset1' }),
      create.filesHelper.createUploadedAsset(em, { user: user1 }, { name: 'user1_asset2' }),
      create.filesHelper.createUploadedAsset(em, { user: user1 }, { name: 'user1_asset3' }),
      create.filesHelper.createUploadedAsset(em, { user: user1 }, { name: 'user1_asset4' }),
      create.filesHelper.createUploadedAsset(em, { user: user1 }, { name: 'user1_asset5' }),
      // user2
      create.filesHelper.createUploadedAsset(em, { user: user2 }, { name: 'user2_asset1' }),
      create.filesHelper.createUploadedAsset(em, { user: user2 }, { name: 'user2_asset2' }),
      create.filesHelper.createUploadedAsset(em, { user: user2 }, { name: 'user2_asset3' }),
      create.filesHelper.createUploadedAsset(em, { user: user2 }, { name: 'user2_asset4' }),
      create.filesHelper.createUploadedAsset(em, { user: user2 }, { name: 'user2_asset5' }),
    ]
    await em.flush()
  })

  it('findAssetWithUid', async () => {
    const repo = em.getRepository(Asset)
    let result = await repo.findAssetWithUid(assets[1].uid)
    expect(result).to.be.not.null()
    expect(result?.name).to.equal('user1_asset2')

    result = await repo.findAssetWithUid(assets[6].uid)
    expect(result).to.be.not.null()
    expect(result?.name).to.equal('user2_asset2')

    result = await repo.findAssetWithUid('file-no-such-uid')
    expect(result).to.be.null()
  })

  it('findUnclosedAssets', async () => {
    const repo = em.getRepository(Asset)
    let result = await repo.findUnclosedAssets(user1.id)
    // There should be done for now
    expect(result).to.have.length(0)

    // Now mark some assets as either 'open', 'closing' or 'closed'
    // user1
    assets[0].state = FILE_STATE_DX.CLOSED
    assets[1].state = FILE_STATE_DX.OPEN
    assets[2].state = FILE_STATE_DX.CLOSING
    assets[3].state = FILE_STATE_DX.CLOSED
    assets[4].state = FILE_STATE_DX.OPEN
    // user2
    assets[5].state = FILE_STATE_DX.OPEN
    assets[6].state = FILE_STATE_DX.ABANDONED
    assets[7].state = FILE_STATE_DX.CLOSED
    await em.flush()

    result = await repo.findUnclosedAssets(user1.id)
    expect(result).to.have.length(3)
    let resultUids = result.map(x => x.uid)
    expect(resultUids).to.deep.equal([assets[1].uid, assets[2].uid, assets[4].uid])

    result = await repo.findUnclosedAssets(user2.id)
    expect(result).to.have.length(1)
    resultUids = result.map(x => x.uid)
    expect(resultUids).to.deep.equal([assets[5].uid])
  })
})
