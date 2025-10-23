import { FilterQuery } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { FILE_STATE_DX } from './user-file.types'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { User } from '@shared/domain/user/user.entity'

type FindByName = {
  scope: SCOPE
  userId: number
  name: string
  parentId: number
}

export class UserFileRepository extends AccessControlRepository<UserFile> {
  protected async getAccessibleWhere(): Promise<FilterQuery<UserFile>> {
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

  protected async getEditableWhere(): Promise<FilterQuery<UserFile>> {
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

  async findFileWithUid(uid: Uid<'file'>, populate?: string[]): Promise<UserFile | null> {
    return await this.findOne(
      { uid },
      {
        populate: (populate as never[]) || (['user', 'taggings.tag'] as never[]),
      },
    )
  }

  async findFilesWithDxid(dxid: DxId<'file'>): Promise<UserFile[]> {
    return await this.find({ dxid }, { populate: ['user', 'taggings.tag'] })
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
