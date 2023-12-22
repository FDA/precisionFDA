import { getLogger } from '../../logger'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Folder, User } from '..'
import { createFolderEvent, EVENT_TYPES } from '../event/event.helper'
import { getNodePath } from './user-file.helper'
import { scopeContainsId } from '../space/space.helper'
import { SCOPE } from '../../types/common'
import { PARENT_TYPE } from './user-file.types'
import { errors } from '../..'
import { getEntityType, InputEntityUnion } from '../../utils/object-utils'

const logger = getLogger('folder.service')

export interface IFolderService {
  createFolder(name: string, scope: SCOPE, userId: number, parent?: InputEntityUnion, parentFolderId?: number): Promise<Folder>
  createFoldersOnPath(path: string, scope: SCOPE, userId: number, parent?: InputEntityUnion): Promise<Folder[]>
}

/**
 * Service for activities on folders
 */
export class FolderService implements IFolderService {

  private readonly em: SqlEntityManager

  constructor(em: SqlEntityManager) {
    this.em = em
  }

  /**
   * Creates folders on a path. If the folder already exists, it is not created and only returned.
   */
  async createFoldersOnPath(path: string, scope: SCOPE, userId: number, parent?: InputEntityUnion,): Promise<Folder[]> {
    logger.log(`FolderService: creating folders ${path} with scope ${scope}`)
    if (!path) {
      throw new errors.ValidationError('Path must not be empty')
    }
    const user = await this.em.getRepository(User).findOneOrFail({ id: userId })
    const folderNames = path.split('/').filter((folder) => folder !== '')

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
    logger.log(`FolderService: creating folder ${name}` + (parentFolderId ? ` with scope ${scope} in folder ${parentFolderId}` : ''))
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
    scope: SCOPE,
    user: User,
    parent?: InputEntityUnion,
    parentFolderId?: number,
  ): Promise<Folder> {
    let folder = await this.findFolder(name, scope, parentFolderId)
    if (folder) {
      logger.log(`FolderService: folder ${name} already exists`)
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

  private async findFolder(name: string, scope: SCOPE, parentFolderId?: number) {
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
