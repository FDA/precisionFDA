import { EntityRepository } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { STATIC_SCOPE } from '../../enums'
import { Asset } from './asset.entity'
import { FILE_STATE_DX } from './user-file.types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

export class AssetRepository extends EntityRepository<Asset> {
  async findAssetWithUid(uid: Uid<'file'>): Promise<Asset | null> {
    return await this.findOne({ uid }, { filters: ['asset'], populate: ['user', 'taggings.tag'] })
  }

  async findAllAssetsWithDxid(dxid: DxId<'file'>): Promise<Asset[]> {
    return await this.find({ dxid }, { filters: ['asset'], populate: ['user', 'taggings.tag'] })
  }

  // Find assets uploaded or owned by a user that are pending
  // transition to closed state from the platform
  async findUnclosedAssets(userId: number): Promise<Asset[]> {
    return await this.find(
      {
        user: userId,
        state: { $in: [FILE_STATE_DX.OPEN, FILE_STATE_DX.CLOSING] },
      },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }

  /**
   * Loads assets identified by uids and verifies if they are accessible by user.
   * @param userId
   * @param uids
   * @param spaceIds
   */
  async findAccessibleByUser(
    userId: number,
    uids: Uid<'file'>[],
    spaceIds: number[],
  ): Promise<Asset[]> {
    const scopes = spaceIds.map((id) => `space-${id}`)
    return await this.find(
      {
        $or: [
          { scope: STATIC_SCOPE.PUBLIC },
          { user: userId, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: (scopes as []) ?? [] } },
        ],
        state: FILE_STATE_DX.CLOSED,
        uid: { $in: uids as [] },
      },
      { filters: ['asset'], populate: ['user', 'taggings.tag'] },
    )
  }
}
