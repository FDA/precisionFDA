import { FilterQuery } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { STATIC_SCOPE } from '@shared/enums'
import { FolderNotFoundError, ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScope, SCOPE } from '../../types/common'
import { getEntityType, InputEntityUnion } from '../../utils/object-utils'
import { EventHelper } from '../event/event.helper'
import { PARENT_TYPE } from './user-file.types'

@Injectable()
/**
 * Service for activities on folders
 */
export class FolderService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly folderRepo: FolderRepository,
    private readonly nodeHelper: NodeHelper,
    private readonly eventHelper: EventHelper,
  ) {}

  async unlockFolder(folderId: number): Promise<void> {
    this.logger.log(`Unlocking folder with id: ${folderId}`)

    const folderToUnlock = await this.folderRepo.findOne(folderId)
    if (!folderToUnlock) {
      throw new FolderNotFoundError()
    }
    const currentUser = await this.userCtx.loadEntity()
    await this.em.transactional(async () => {
      const folderPath = await this.nodeHelper.getNodePath(folderToUnlock)

      const folderEvent = await this.eventHelper.createFolderEvent(
        EVENT_TYPES.FOLDER_UNLOCKED,
        folderToUnlock,
        folderPath,
        currentUser,
      )
      folderToUnlock.locked = false
      folderToUnlock.state = null

      await this.em.persistAndFlush(folderEvent)
      this.logger.log(`Unlocked folder name: ${folderToUnlock.name} id: ${folderToUnlock.id}`)
    })
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
    const folderNames = path.split('/').filter(folder => folder !== '')

    const createdFolders: Folder[] = []
    let parentFolder: Folder | undefined
    for (const folderName of folderNames) {
      const folder: Folder = await this.createFolderInternal(folderName, scope, user, parent, parentFolder?.id)
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
    this.logger.log(`Creating folder ${parentFolderId ? ` with scope ${scope} in folder ${parentFolderId}` : ''}`)
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

  async getFolderEntity(folderId: number): Promise<Folder | null> {
    return await this.folderRepo.findEditableOne({ id: folderId })
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

    if (folder.isInSpace()) {
      folder.scopedParentFolderId = parentFolderId && parentFolderId
    } else {
      folder.parentFolderId = parentFolderId && parentFolderId
    }

    await this.em.persistAndFlush(folder)
    await this.createEventForFolder(folder, EVENT_TYPES.FOLDER_CREATED, user)
    return folder
  }

  private async findFolder(name: string, scope: EntityScope, parentFolderId?: number): Promise<Folder> {
    const whereClause: FilterQuery<NoInfer<Folder>> = {
      name,
      scope,
      $or: [{ scopedParentFolderId: parentFolderId }, { parentFolderId: parentFolderId }],
    }

    // Add the user condition only when the scope is private
    if (scope === STATIC_SCOPE.PRIVATE) {
      whereClause.user = this.userCtx.id
    }

    return await this.em.findOne(Folder, whereClause)
  }

  private async createEventForFolder(folder: Folder, eventType: EVENT_TYPES, user: User): Promise<void> {
    const loadedFolder = await this.em
      .getRepository(Folder)
      .findOneOrFail({ id: folder.id }, { populate: ['parentFolder', 'scopedParentFolder'] })

    const folderPath = await this.nodeHelper.getNodePath(loadedFolder)

    const folderEvent = await this.eventHelper.createFolderEvent(eventType, loadedFolder, folderPath, user)

    this.em.persist(folderEvent)
  }
}
