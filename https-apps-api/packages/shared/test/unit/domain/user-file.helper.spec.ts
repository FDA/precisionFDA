import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { Asset, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database } from '../../../src/database'
import {
  findFileOrAssetWithUid,
  findFileOrAssetsWithDxid,
} from 'shared/src/domain/user-file/user-file.helper'

// TODO: Migrate tests from user-file.helper.spec.ts in api and worker packages here

describe('user-file.helper', () => {
  context('findFileOrAsset helpers', () => {
    let em: EntityManager<MySqlDriver>
    let user: User
    let file: UserFile
    let asset: Asset
    const fileUid = 'file-custom-uid'
    const assetUid = 'asset-custom-uid'

    beforeEach(async () => {
      await db.dropData(database.connection())
      em = database.orm().em.fork()
      user = create.userHelper.create(em)
      await em.flush()

      file = create.filesHelper.create(em, { user }, { uid: fileUid })
      asset = create.filesHelper.createUploadedAsset(em, { user }, { uid: assetUid })
      await em.flush()
    })

    it('findFileOrAssetWithUid should return a file', async () => {
      const result = await findFileOrAssetWithUid(em, file.uid)
      expect(result).to.be.not.null()
      if (result) {
        expect(result.uid).to.equal(file.uid)
      }
    })

    it('findFileOrAssetWithUid should return an asset', async () => {
      const result = await findFileOrAssetWithUid(em, asset.uid)
      expect(result).to.be.not.null()
      if (result) {
        expect(result.uid).to.equal(asset.uid)
      }
    })

    it('findFileOrAssetWithUid should return null if the uid is neither file or asset', async () => {
      const result = await findFileOrAssetWithUid(em, 'friday-night-uid')
      expect(result).to.be.null()
    })

    it('findFileOrAssetsWithDxid should return a file', async () => {
      const result = await findFileOrAssetsWithDxid(em, file.dxid)
      expect(result).to.be.not.null()
      expect(result!.length).to.equal(1)
      expect(result![0].dxid).to.equal(file.dxid)
    })

    it('findFileOrAssetsWithDxid should return an asset', async () => {
      const result = await findFileOrAssetsWithDxid(em, asset.dxid)
      expect(result).to.be.not.null()
      expect(result!.length).to.equal(1)
      expect(result![0].dxid).to.equal(asset.dxid)
    })

    it('findFileOrAssetsWithDxid should return null if the uid is neither file or asset', async () => {
      const result = await findFileOrAssetsWithDxid(em, 'saturday-night-uid')
      expect(result).to.deep.equal([])
    })
  })
})
