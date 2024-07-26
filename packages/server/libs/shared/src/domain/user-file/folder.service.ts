import { Folder } from '@shared/domain/user-file/folder.entity'
import { User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { createFolderEvent, EVENT_TYPES } from '../event/event.helper'
import { getNodePath } from './user-file.helper'
import { scopeContainsId } from '../space/space.helper'
import { EntityScope, SCOPE } from '../../types/common'
import { PARENT_TYPE } from './user-file.types'
import { getEntityType, InputEntityUnion } from '../../utils/object-utils'
import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
/**
 * Service for activities on folders
 */
export class FolderService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly em: SqlEntityManager) {
    this.em = em
  }

  /**
   * Creates folders on a path. If the folder already exists, it is not created and only returned.
   */
  async createFoldersOnPath(
    path: string,
    scope: EntityScope,
    userId: number,
    parent?: InputEntityUnion,
  ): Promise<Folder[]> {
    this.logger.log(`Creating folders ${path} with scope ${scope}`)
    if (!path) {
      throw new ValidationError('Path must not be empty')
    }
    const user = await this.em.getRepository(User).findOneOrFail({ id: userId })
    const folderNames = path.split('/').filter((folder) => folder !== '')

    const createdFolders: Folder[] = []
    let parentFolder: Folder | undefined
    for (const folderName of folderNames) {
      const folder: Folder = await this.createFolderInternal(
        folderName,
        scope,
        user,
        parent,
        parentFolder?.id,
      )
      createdFolders.push(folder)
      parentFolder = folder
    }

    return createdFolders
  }

  /**
   * Creates a folder. If the folder already exists, it is not created.
   */
  async createFolder(
    name: string,
    scope: SCOPE,
    userId: number,
    parent?: InputEntityUnion,
    parentFolderId?: number,
  ): Promise<Folder> {
    this.logger.log(`Creating folder ` + (parentFolderId ? ` with scope ${scope} in folder ${parentFolderId}` : ''))
    const user = await this.em.getRepository(User).findOneOrFail({ id: userId })

    try {
      await this.em.begin()

      const folder = await this.createFolderInternal(name, scope, user, parent, parentFolderId)

      await this.em.commit()
      return folder
    } catch (error) {
      await this.em.rollback()
      throw error
    }
  }

  private async createFolderInternal(
    name: string,
    scope: EntityScope,
    user: User,
    parent?: InputEntityUnion,
    parentFolderId?: number,
  ): Promise<Folder> {
    let folder = await this.findFolder(name, scope, parentFolderId)
    if (folder) {
      this.logger.log(`Folder ${name} already exists`)
      return folder
    }

    folder = new Folder(user)
    folder.name = name
    folder.scope = scope

    if (parent) {
      const entityType = getEntityType(parent)
      folder.parentType = entityType as unknown as PARENT_TYPE
      folder.parentId = parent.value.id
    }

    if (scopeContainsId(scope)) {
      folder.scopedParentFolderId = parentFolderId && parentFolderId
    } else {
      folder.parentFolderId = parentFolderId && parentFolderId
    }

    await this.em.persistAndFlush(folder)
    await this.createEventForFolder(folder, EVENT_TYPES.FOLDER_CREATED, user)
    return folder
  }

  private async findFolder(name: string, scope: EntityScope, parentFolderId?: number) {
    if (scopeContainsId(scope)) {
      return await this.em.getRepository(Folder).findOne({
        name,
        scope,
        scopedParentFolderId: parentFolderId,
      })
    } else {
      return await this.em.getRepository(Folder).findOne({
        name,
        scope,
        parentFolderId: parentFolderId,
      })
    }
  }

  private async createEventForFolder(folder: Folder, eventType: string, user: User): Promise<void> {
    const loadedFolder = await this.em.getRepository(Folder).findOneOrFail(
      { id: folder.id },
      { populate: ['parentFolder', 'scopedParentFolder'] },
    )

    const folderPath = await getNodePath(this.em, loadedFolder)

    const folderEvent = await createFolderEvent(
      eventType,
      loadedFolder,
      folderPath,
      user,
    )

    this.em.persist(folderEvent)
  }
}
