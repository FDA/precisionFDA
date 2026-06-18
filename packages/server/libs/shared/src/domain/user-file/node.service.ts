import { FindOptions } from '@mikro-orm/core'
import { FilterQuery, Loaded, Populate, SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { CountStats } from '@shared/database/statistics.type'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { CAN_EDIT_ROLES } from '@shared/domain/space-membership/space-membership.helper'
import { UserRepository } from '@shared/domain/user/user.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { UserFilePaginationDTO } from '@shared/domain/user-file/dto/user-file-pagination.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { AssetCountService } from '@shared/domain/user-file/service/asset-count.service'
import { FileCountService } from '@shared/domain/user-file/service/file-count.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FOLLOW_UP_ACTION, nodeQueryFilter } from '@shared/domain/user-file/user-file.input'
import {
  ExistingFileSet,
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  FileOrAsset,
  SelectedNode,
} from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScope, SCOPE } from '@shared/types/common'
import { InputEntityUnion } from '@shared/utils/object-utils'
import { StringUtils } from '@shared/utils/string.utils'
import { PaginatedResult } from '../entity/domain/paginated.result'
import { FetchChildrenDTO } from './dto/fetch-children.dto'
import { UserFileAccessibleResultDTO } from './dto/user-file-accessible-result.dto'

@Injectable()
export class NodeService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userFileService: UserFileService,
    private readonly folderService: FolderService,
    private readonly spaceRepository: SpaceRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly userRepository: UserRepository,
    private readonly nodeHelper: NodeHelper,
    private readonly fileCountService: FileCountService,
    private readonly assetCountService: AssetCountService,
    private readonly assetRepository: AssetRepository,
  ) {}

  /**
   * Count files based on the given scope filter context
   */
  async countFiles(context: ScopeFilterContext): Promise<number> {
    return this.fileCountService.count(context)
  }

  /**
   * Count assets based on the given scope filter context
   */
  async countAssets(context: ScopeFilterContext): Promise<number> {
    return this.assetCountService.count(context)
  }

  getAccessibleEntityByUid(uid: Uid<'file'>): Promise<FileOrAsset> {
    return this.nodeRepository.findAccessibleOne({
      uid,
      stiType: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET],
    }) as Promise<UserFile>
  }

  async listAccessibleAssets<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Asset>,
    options?: Omit<FindOptions<Asset, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Asset, Hint, Fields, Excludes>[]> {
    return this.assetRepository.findAccessible(where, options)
  }

  getEditableEntityByUid(uid: Uid<'file'>): Promise<FileOrAsset> {
    return this.nodeRepository.findEditableOne({
      uid,
      stiType: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET],
    }) as Promise<UserFile>
  }

  getAccessibleEntitiesByUids(uids: Uid<'file'>[], stiTypes?: FILE_STI_TYPE[]): Promise<FileOrAsset[]> {
    return this.nodeRepository.findAccessible({
      uid: { $in: uids },
      stiType: stiTypes ?? [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET],
    }) as Promise<UserFile[]>
  }

  /**
   * Returns files and folders in a given scope defined by input.
   *
   * @param input
   */
  async getFolderChildren(input: FetchChildrenDTO): Promise<Node[]> {
    const parentId = input.folderId ?? null

    const scopeConditions = input.scopes.map(scope => {
      const condition: FilterQuery<Node> = { scope }

      if (scope.startsWith('space')) {
        condition.scopedParentFolder = parentId
      } else {
        condition.parentFolder = parentId
      }

      if (scope === STATIC_SCOPE.PRIVATE) {
        condition.user = this.user.id
      }

      return condition
    })

    const where: FilterQuery<Node> = {
      $or: scopeConditions,
    }

    if (input.types?.length) {
      where.stiType = { $in: input.types }
    }

    return this.nodeRepository.findAccessible(where, {
      orderBy: [{ stiType: 'ASC' }, { name: 'ASC' }],
    })
  }

  getEditableEntityById(id: number): Promise<Node> {
    return this.nodeRepository.findEditableOne({ id })
  }

  getAccessibleEntityById(id: number): Promise<Node> {
    return this.nodeRepository.findAccessibleOne({ id })
  }

  async markNodesAsRemoving(ids: number[]): Promise<void> {
    const nodes = await this.nodeRepository.find({ id: { $in: ids } })
    nodes.forEach(node => {
      node.state = FILE_STATE_PFDA.REMOVING
    })

    await this.em.flush()
  }

  /**
   * Validates if node is editable by current user. Which means:
   * - node is not locked
   * - node is public or user is owner or user is site admin
   * - if node is in space, user has edit role in space
   * @param node
   */
  async validateEditableBy(node: Node): Promise<void> {
    if (node.locked) {
      throw new Error('Locked items cannot be removed.')
    }
    const currentUser = await this.userRepository.findOne(this.user.id)
    if (node.isPublic() || (node.user.id === currentUser.id && node.isPrivate()) || (await currentUser.isSiteAdmin())) {
      return
    }
    if (node.isInSpace()) {
      const spaceId = node.getSpaceId()
      const space = await this.spaceRepository.findOne({
        id: spaceId,
        state: SPACE_STATE.ACTIVE,
        spaceMemberships: {
          user: {
            id: currentUser.id,
          },
          role: CAN_EDIT_ROLES,
        },
      })
      if (space) return
    }
    throw new PermissionError(`You have no permissions to remove '${node.name}'.`)
  }

  async rollbackRemovingState(nodes: Node[]): Promise<void> {
    this.logger.error(`Rolling back removing state for nodes ${nodes.map(node => node.id)}`)
    nodes.forEach(node => {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        node.state = null
      } else {
        node.state = FILE_STATE_DX.CLOSED
      }
    })
    await this.em.persistAndFlush(nodes)
  }

  async getUserFileOrAsset(fileUid: Uid<'file'>): Promise<FileOrAsset | null> {
    return (await this.nodeRepository.findAccessibleOne({
      uid: fileUid,
      stiType: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET],
    })) as FileOrAsset | null
  }

  async getEditableFolder(id: number): Promise<Folder | null> {
    return this.nodeRepository.findEditableOne({ id, stiType: FILE_STI_TYPE.FOLDER }) as Promise<Folder | null>
  }

  /**
   * Loads the whole tree that is filtered by parameters and returns
   * it sorted with leaves first
   *
   * @param ids
   * @param filters
   * @returns
   */
  async loadNodes(ids: number[], filters: nodeQueryFilter): Promise<Node[]> {
    this.logger.log(`Loading nodes ${ids} with filters ${JSON.stringify(filters)}`)
    const nodes: Node[] = await this.nodeRepository.find({
      $or: [
        {
          id: { $in: ids },
          ...filters,
        },
        {
          scopedParentFolder: { $in: ids },
          ...filters,
        },
      ],
    })
    await this.em.populate(nodes, ['parentFolder', 'scopedParentFolder'])
    const wholeTree: Node[] = []
    for (const node of nodes) {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        await this.nodeHelper.collectChildren(node as Folder, wholeTree)
      } else {
        wholeTree.push(node)
      }
    }
    // ensure uniqueness
    const unique = [...new Map(wholeTree.map(item => [item.id, item])).values()]
    // sort all nodes, folders last
    unique.sort((a, b) => {
      // First, check if one is a folder and the other is not
      if (a.isFolder && !b.isFolder) return 1 // a is a folder, b is not, put a last
      if (!a.isFolder && b.isFolder) return -1 // b is a folder, a is not, put b last

      // If both are either folders or non-folders, sort by id in descending order
      return b.id - a.id
    })
    return unique
  }

  // Proxy methods
  async synchronizeFile(fileUid: Uid<'file'>, isChallengeBotFile: boolean): Promise<boolean> {
    return await this.userFileService.synchronizeFile(fileUid, isChallengeBotFile)
  }

  async closeFile(fileUid: Uid<'file'>, followUpAction?: FOLLOW_UP_ACTION): Promise<void> {
    await this.userFileService.closeFile(fileUid, followUpAction)
  }

  async listSelectedFiles(ids: number[]): Promise<SelectedNode[]> {
    return await this.userFileService.listSelectedFiles(ids)
  }

  async validateCopyFiles(uids: Uid<'file'>[], targetScope: EntityScope): Promise<ExistingFileSet> {
    return await this.userFileService.validateCopyFiles(uids, targetScope)
  }

  async validateAssetRemoval(assetToRemove: Asset): Promise<void> {
    await this.userFileService.validateAssetRemoval(assetToRemove)
  }

  async validateSpaceReports(fileToRemove: UserFile): Promise<void> {
    await this.userFileService.validateSpaceReports(fileToRemove)
  }

  async validateProtectedSpaces(action: string, userId: number, node: Node): Promise<void> {
    await this.userFileService.validateProtectedSpaces(action, userId, node)
  }

  async createFile(fileCreate: UserFileCreate): Promise<UserFile> {
    return await this.userFileService.createFile(fileCreate)
  }

  async lockFile(fileId: number): Promise<void> {
    await this.userFileService.lockFile(fileId)
  }

  async unlockFile(fileId: number): Promise<void> {
    await this.userFileService.unlockFile(fileId)
  }

  async createFoldersOnPath(
    path: string,
    scope: EntityScope,
    userId: number,
    parent?: InputEntityUnion,
  ): Promise<Folder[]> {
    return await this.folderService.createFoldersOnPath(path, scope, userId, parent)
  }

  async createFolder(
    name: string,
    scope: SCOPE,
    userId: number,
    parent?: InputEntityUnion,
    parentFolderId?: number,
  ): Promise<Folder> {
    return await this.folderService.createFolder(name, scope, userId, parent, parentFolderId)
  }

  async getFolderEntity(folderId: number): Promise<Folder | null> {
    return await this.folderService.getFolderEntity(folderId)
  }

  async getStatistics(): Promise<CountStats> {
    return await this.nodeRepository.getStatistics()
  }

  async paginate(query: UserFilePaginationDTO): Promise<PaginatedResult<Node>> {
    const pagination = {
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
    }
    const where = await this.buildCommonFilters(query)

    const populate = ['user']
    if (query.fields?.path) {
      populate.push('parentFolder', 'scopedParentFolder')
    }
    if (query.fields?.tags) {
      populate.push('taggings', 'taggings.tag')
    }
    if (query.fields?.properties) {
      populate.push('properties')
    }

    const result = await this.nodeRepository.paginate(pagination, where, {})
    await this.em.populate(result.data, populate as unknown as Populate<Node>)

    return result
  }

  async verifyAccessibleFiles(uids: Uid<'file'>[]): Promise<UserFileAccessibleResultDTO> {
    return await this.userFileService.verifyAccessibleFiles(uids)
  }

  private async buildCommonFilters(query: UserFilePaginationDTO): Promise<FilterQuery<UserFile>> {
    const userEntity = await this.user.loadEntity()
    const accessibleSpaces = await userEntity.accessibleSpaces()
    const accessibleScopes: EntityScope[] = accessibleSpaces.map(space => space.scope)
    const accessibleScopeSet = new Set(accessibleScopes)
    const where: FilterQuery<UserFile> = {
      stiType: query.type ?? [FILE_STI_TYPE.USERFILE],
      $or: [],
      $and: [],
    }
    if (query.uids?.length) {
      where.$and.push({
        $or: query.uids.map(uid => ({ uid: new RegExp(uid, 'i') })),
      })
    }
    if (query.ignoreChallengeBot) {
      where.user = { dxuser: { $ne: config.platform.challengeBotUser } }
    }
    if (!query.scope) {
      where.$or.push(
        { user: this.user.id, scope: 'private' },
        { scope: 'public' },
        { scope: { $in: accessibleScopes } },
      )
    } else {
      if (query.scope === 'private') {
        where.$or.push({ user: this.user.id, scope: 'private' })
      }
      if (query.scope === 'public') {
        where.$or.push({ scope: 'public' })
      }
      if (query.scope === 'spaces') {
        where.$or.push({ scope: { $in: accessibleScopes } })
      } else if (accessibleScopeSet.has(query.scope)) {
        where.$or.push({
          scope: { $in: [query.scope] },
        })
      }
    }
    if (query.folderId) {
      where.$and.push({
        $or: [{ parentFolder: query.folderId }, { scopedParentFolder: query.folderId }],
      })
    } else if (query.folderId === null) {
      where.$and.push({
        parentFolder: null,
        scopedParentFolder: null,
      })
    }
    if (query.filter?.name) {
      where.name = { $like: `%${query.filter.name}%` }
    }
    if (query.filter?.states) {
      where.state = { $in: query.filter.states }
    }

    if (query.filter?.size) {
      const { lower, upper } = query.filter.size
      where.fileSize = {
        ...(lower !== undefined && { $gte: lower }),
        ...(upper !== undefined && { $lte: upper }),
      }
    }

    if (query.filter?.tags !== undefined) {
      const likeConditions = query.filter.tags.map(tag => {
        const safePattern = StringUtils.escapeRegExp(tag)
        return { name: new RegExp(safePattern, 'i') }
      })
      where.taggings = { tag: { $or: likeConditions } }
    }

    return where
  }
}
