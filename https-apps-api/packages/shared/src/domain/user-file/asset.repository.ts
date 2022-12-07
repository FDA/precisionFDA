import { EntityRepository } from '@mikro-orm/mysql'
import { Asset } from './asset.entity'
import { FILE_STATE_DX } from './user-file.types'


export class AssetRepository extends EntityRepository<Asset> {
  async findAssetWithUid(uid: string): Promise<Asset | null> {
    return await this.findOne(
      { uid },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }

  // Find assets uploaded or owned by a user that are pending
  // transition to closed state from the platform
  async findUnclosedAssets(userId: number): Promise<Asset[]> {
    return await this.find(
      {
        userId,
        state: { $in: [FILE_STATE_DX.OPEN, FILE_STATE_DX.CLOSING] },
      },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }
}
