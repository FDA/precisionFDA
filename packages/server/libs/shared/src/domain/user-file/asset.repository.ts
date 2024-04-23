import { EntityRepository } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { SCOPE } from '@shared/types/common'
import { Asset } from './asset.entity'
import { FILE_STATE_DX } from './user-file.types'
import { STATIC_SCOPE } from '../../enums'

export class AssetRepository extends EntityRepository<Asset> {
  async findAssetWithUid(uid: string): Promise<Asset | null> {
    return await this.findOne(
      { uid },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }

  async findAllAssetsWithDxid(dxid: string): Promise<Asset[]> {
    return await this.find({ dxid }, { filters: ['asset'], populate: ['user', 'taggings.tag'] })
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

  /**
   * Loads assets identified by uids and verifies if they are accessible by user.
   * @param userId
   * @param uids
   */
  async findAccessibleByUser(userId: number, uids: string[]): Promise<Asset[]> {
    const userRepository = this._em.getRepository(User)
    const user: User = await userRepository.findOneOrFail(
      { id: userId },
      { populate: ['spaceMemberships', 'spaceMemberships.spaces'] },
    )
    return await this.find(
      {
        $or: [
          { scope: STATIC_SCOPE.PUBLIC },
          { user, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: (user.spaceUids as SCOPE[]) ?? [] } },
        ],
        state: FILE_STATE_DX.CLOSED,
        uid: { $in: uids },
      },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }
}
