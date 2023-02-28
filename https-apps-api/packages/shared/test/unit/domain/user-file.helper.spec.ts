import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { Asset, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database } from '../../../src/database'
import { findFileOrAssetWithUid } from 'shared/src/domain/user-file/user-file.helper'

// TODO: Migrate tests from user-file.helper.spec.ts in api and worker packages here

describe('user-file.helper', () => {
  context('findFileOrAssetWithUid()', () => {
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

    it('should return a file', async () => {
      const result = await findFileOrAssetWithUid(em, file.uid)
      expect(result).to.be.not.null()
      if (result) {
        expect(result.uid).to.equal(file.uid)
      }
    })

    it('should return an asset', async () => {
      const result = await findFileOrAssetWithUid(em, asset.uid)
      expect(result).to.be.not.null()
      if (result) {
        expect(result.uid).to.equal(asset.uid)
      }
    })

    it('should return null if the uid is neither file or asset', async () => {
      const result = await findFileOrAssetWithUid(em, 'friday-night-uid')
      expect(result).to.be.null()
    })
  })
})
