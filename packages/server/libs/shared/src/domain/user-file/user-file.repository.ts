import { FilterQuery } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { FILE_STATE_DX } from './user-file.types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { User } from '@shared/domain/user/user.entity'

type FindByName = {
  scope: SCOPE
  userId: number
  name: string
  parentId: number
}

export class UserFileRepository extends AccessControlRepository<UserFile> {
  protected async getAccessibleWhere(): Promise<FilterQuery<UserFile>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes = accessibleSpaces.map((space) => space.scope)

    //TODO: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<UserFile>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const spaceScopes = editableSpaces.map((space) => space.scope)

    //TODO: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }
  /**
   * Loads userfile identified by uids and verifies if they are accessible by user.
   * @param userId
   * @param uids
   */
  async findAccessibleByUser(userId: number, uids: Uid<'file'>[]): Promise<UserFile[]> {
    const smRepository = this.em.getRepository(SpaceMembership)
    const spaceUids = await smRepository.findActiveSpaceIdsByUserId(userId)
    const scopes = spaceUids.map((id) => `space-${id}`)

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

  async findFileWithUid(uid: Uid<'file'>, populate?: string[]): Promise<UserFile | null> {
    return await this.findOne(
      { uid },
      {
        filters: ['userfile'],
        populate: (populate as never[]) || (['user', 'taggings.tag'] as never[]),
      },
    )
  }

  async findFilesWithDxid(dxid: DxId<'file'>): Promise<UserFile[]> {
    return await this.find({ dxid }, { filters: ['userfile'], populate: ['user', 'taggings.tag'] })
  }

  // Find files uploaded or owned by a user that are pending
  // transition to closed state from the platform
  async findUnclosedFiles(userId: number): Promise<UserFile[]> {
    return await this.find(
      {
        user: userId,
        state: { $in: [FILE_STATE_DX.OPEN, FILE_STATE_DX.CLOSING] },
      },
      {
        filters: ['userfile'],
        populate: ['taggings.tag', 'user'],
      },
    )
  }

  async findAllFilesByName({ name, parentId, userId, scope }: FindByName): Promise<UserFile[]> {
    const parentKey = scope.startsWith('space') ? 'scopedParentFolderId' : 'parentFolderId'

    return scope === STATIC_SCOPE.PRIVATE
      ? this.find(
          { name, [parentKey]: parentId, user: userId, scope },
          { populate: ['taggings.tag'], orderBy: { createdAt: 'ASC' } },
        )
      : this.find(
          { name, [parentKey]: parentId, scope },
          { populate: ['taggings.tag'], orderBy: { createdAt: 'ASC' } },
        )
  }
}
