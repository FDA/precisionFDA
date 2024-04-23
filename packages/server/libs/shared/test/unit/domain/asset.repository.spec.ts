/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { create, db } from '@shared/test'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '../../../src/enums'

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

  it('findAccessibleByUser', async () => {
    // prepare assets for user1 - should appear in results
    // in public scope - yes
    assets[0].scope = STATIC_SCOPE.PUBLIC
    // in private scope for user1 - yes
    assets[1].scope = STATIC_SCOPE.PRIVATE
    // in private scope for different user - no
    assets[5].scope = STATIC_SCOPE.PRIVATE
    // in space the user has membership - yes
    const space1 = create.spacesHelper.create(em, {name: 'space1'})
    create.spacesHelper.addMember(em, {space: space1, user: user1})
    await em.flush()
    assets[2].scope = space1.uid
    // in space that the user has no membership - no
    const space2 = create.spacesHelper.create(em, {name: 'space2'})
    create.spacesHelper.addMember(em, {space: space2, user: user2})
    await em.flush()
    assets[3].scope = space2.uid
    await em.flush()

    // get ids for all assets (test filtering)
    const uids = assets.map(asset => asset.uid)
    const repo = em.getRepository(Asset)
    let result = await repo.findAccessibleByUser(user1.id, uids)

    expect(result.length).to.equal(4)
    const publicAsset = result.filter(asset => asset.scope === STATIC_SCOPE.PUBLIC.toString())[0]
    expect(publicAsset.name).to.equal('user1_asset1')
    const privateAssets = result.filter(asset => asset.scope === STATIC_SCOPE.PRIVATE.toString())
    expect(privateAssets.length).to.equal(2)
    const spaceAsset = result.filter(asset => asset.scope === 'space-1')[0]
    expect(spaceAsset.name).to.equal('user1_asset3')
  })
})
