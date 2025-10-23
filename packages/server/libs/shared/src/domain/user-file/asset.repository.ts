import { FilterQuery } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { STATIC_SCOPE } from '../../enums'
import { Asset } from './asset.entity'
import { FILE_STATE_DX } from './user-file.types'
import { User } from '@shared/domain/user/user.entity'

export class AssetRepository extends AccessControlRepository<Asset> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Asset>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }
    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes = accessibleSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Asset>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }
    const editableSpaces = await user.editableSpaces()
    const spaceScopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }
  async findAssetWithUid(uid: Uid<'file'>): Promise<Asset | null> {
    return await this.findOne({ uid }, { populate: ['user', 'taggings.tag'] })
  }

  async findAllAssetsWithDxid(dxid: DxId<'file'>): Promise<Asset[]> {
    return await this.find({ dxid }, { populate: ['user', 'taggings.tag'] })
  }

  // Find assets uploaded or owned by a user that are pending
  // transition to closed state from the platform
  async findUnclosedAssets(userId: number): Promise<Asset[]> {
    return await this.find(
      {
        user: userId,
        state: { $in: [FILE_STATE_DX.OPEN, FILE_STATE_DX.CLOSING] },
      },
      { populate: ['user', 'taggings.tag'] },
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
      { populate: ['user', 'taggings.tag'] },
    )
  }
}
