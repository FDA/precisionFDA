import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityService } from '@shared/domain/entity/entity.service'
import * as eventHelper from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import {
  ASSET_VALIDATION_ERROR,
  DeleteRelationError,
  PermissionError,
  ValidationError,
} from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { FileDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { createFileSynchronizeJobTask } from '@shared/queue'
import { UserCtx } from '@shared/types'
import { EntityScope, SpaceScope } from '@shared/types/common'
import { TimeUtils } from '@shared/utils/time.utils'
import { UserFileCreate } from '../domain/user-file-create'
import { Folder } from '../folder.entity'
import { UserFile } from '../user-file.entity'
import { FOLLOW_UP_ACTION } from '../user-file.input'
import {
  BulkDownloadFiles,
  ExistingFileSet,
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STI_TYPE,
  FileOrAsset,
  SelectedFile,
  SelectedFolder,
  SelectedNode,
} from '../user-file.types'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { NodeService } from '@shared/domain/user-file/node.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'

@Injectable()
export class UserFileService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly userClient: PlatformClient,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT) private readonly challengeBotClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly nodeRepo: NodeRepository,
    private readonly fileRepo: UserFileRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly licensedItemRepo: LicensedItemRepository,
    private readonly nodeHelper: NodeHelper,
    private readonly entityService: EntityService,
    private readonly nodeService: NodeService,
    private readonly spaceEventService: SpaceEventService,
  ) {}

  /**
   * Loads file and returns it if the user is allowed to close it.
   * Returns the node with a boolean flag indicating if it's a challenge file.
   *
   * Note: works for both UserFile and Asset
   * @param fileUid
   * @private
   */
  private async getFile(fileUid: Uid<'file'>): Promise<[Asset | UserFile, boolean]> {
    const user = await this.userCtx.loadEntity()
    const userIsAdmin = (await user.isSiteAdmin()) || (await user.isChallengeAdmin())
    if (userIsAdmin) {
      // first read file to find out if it's a challenge file
      const challengeFile = await this.fileRepo.findOne(
        { uid: fileUid },
        { populate: ['challengeResources', 'user'] },
      )
      if (challengeFile?.isCreatedByChallengeBot()) {
        return [challengeFile, true]
      }
    }

    // if it's not challenge file then do regular search
    const accessibleSpaceIds = await user.accessibleSpaceIds()
    const file = await this.nodeRepo.loadIfAccessibleByUser(user, fileUid, accessibleSpaceIds)
    if (!file) {
      throw new PermissionError(`User ${user.dxuser} does not have access to file ${fileUid}`)
    }
    return [file as FileOrAsset, false]
  }

  async getUserFile(fileUid: Uid<'file'>): Promise<UserFile | null> {
    return await this.fileRepo.findAccessibleOne({ uid: fileUid })
  }

  private async closeFileOnPlatform(fileDxid: string, challengeBotFile: boolean): Promise<void> {
    this.logger.log({ fileDxid }, 'Calling close file on platform')
    const platformClient = challengeBotFile ? this.challengeBotClient : this.userClient
    const response = await platformClient.fileClose({
      fileDxid,
    })
    this.logger.log({ response }, 'File close response')
  }

  private async startFileSynchronization(
    fileUid: string,
    isChallengeBotFile: boolean,
    userCtx: UserCtx,
    followUpAction?: FOLLOW_UP_ACTION,
  ): Promise<void> {
    await createFileSynchronizeJobTask({ fileUid, isChallengeBotFile, followUpAction }, userCtx)
  }

  private async handleFileClose(
    fileUid: string,
    userId: number,
    fileDescribe: FileDescribeResponse,
    node: Node,
  ): Promise<void> {
    this.logger.log(`File with uid: ${fileUid} is closed`)
    node.state = fileDescribe.state as FILE_STATE
    node.fileSize = fileDescribe.size
    await this.em.flush()

    if (node.isInSpace()) {
      await this.spaceEventService.createAndSendSpaceEvent({
        spaceId: node.getSpaceId(),
        userId: this.userCtx.id,
        entity: {
          type: 'userFile',
          value: node as UserFile,
        },
        activityType: SPACE_EVENT_ACTIVITY_TYPE.file_added,
      })
    }

    try {
      await this.notificationService.createNotification({
        message: `File ${node.name} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
  }

  private async getEnclosingFolderPath(tm: SqlEntityManager, folderId?: number): Promise<string> {
    if (!folderId) {
      return null
    }
    const enclosingFolder = await this.nodeRepo.findOneOrFail({ id: folderId })
    return await userFileHelper.getNodePath(tm, enclosingFolder)
  }

  /**
   * Returns an array of file paths and urls for bulk download.
   * @param fileIDs
   * @param folderId
   */
  async composeFilesForBulkDownload(
    fileIDs: number[],
    folderId?: number,
  ): Promise<BulkDownloadFiles> {
    const loadedUser = await this.userCtx.loadEntity()
    await this.em.populate(loadedUser, ['spaceMemberships', 'spaceMemberships.spaces'])
    let nodes = await this.getAccessibleNodes(fileIDs)

    const warnings = this.nodeHelper.getWarningsForUnclosedFiles(nodes)
    if (warnings) {
      await this.notificationService.createNotification({
        message: warnings,
        severity: SEVERITY.WARN,
        action: NOTIFICATION_ACTION.DOWNLOAD_FILES_WARNING,
        userId: this.userCtx.id,
      })
    }
    nodes = nodes.filter((node) => node.state === 'closed')
    nodes = this.nodeHelper.sanitizeNodeNames(nodes)
    nodes = this.nodeHelper.renameDuplicateFiles(nodes)
    const enclosingFolderPath = await this.getEnclosingFolderPath(this.em, folderId)

    return {
      files: await this.em.transactional(async (tm) => {
        const filePromises = nodes
          .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE)
          .map(async (node) => {
            return await this.processFile(tm, node, loadedUser, enclosingFolderPath)
          })
        return Promise.all(filePromises)
      }),
      scope: nodes[0].scope,
    }
  }

  private async processFile(
    tm: SqlEntityManager,
    node: Asset | UserFile,
    loadedUser: User,
    enclosingFolderPath: string,
  ): Promise<{ url: string; path: string }> {
    const filePath = await userFileHelper.getNodePath(tm, node)
    const fileDownloadLinkResponse = await this.userClient.fileDownloadLink({
      fileDxid: node.dxid,
      filename: node.name,
      project: node.project,
      duration: TimeUtils.daysToSeconds(1),
    })
    const fileEvent = await eventHelper.createFileEvent(
      eventHelper.EVENT_TYPES.FILE_BULK_DOWNLOAD,
      node as unknown as FileOrAsset,
      filePath,
      loadedUser,
    )
    tm.persist(fileEvent)
    return {
      url: fileDownloadLinkResponse.url,
      path:
        enclosingFolderPath && filePath.startsWith(enclosingFolderPath)
          ? filePath.slice(enclosingFolderPath.length)
          : filePath,
    }
  }

  private async getAccessibleNodes(fileIDs: number[]): Promise<(Asset | UserFile)[]> {
    const nodes = (await this.nodeService.loadNodes(fileIDs, {})) as (Asset | UserFile)[]
    const idsToCheck = nodes
      .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE)
      .map((node) => node.id)
    const accessibleNodes = await this.nodeRepo.findAccessible({ id: idsToCheck })
    if (idsToCheck.length != accessibleNodes.length) {
      throw new PermissionError('You do not have permission to download all of these files')
    }
    return nodes
  }

  async closeFile(fileUid: Uid<'file'>, followUpAction?: FOLLOW_UP_ACTION): Promise<void> {
    this.logger.log(`Closing file ${fileUid}`)

    await this.em.transactional(async () => {
      const [file, isChallengeBotFile] = await this.getFile(fileUid)

      if (file.state !== FILE_STATE_DX.OPEN) {
        throw new ValidationError(
          `File ${fileUid} is not in open state. Current state: "${file.state}"`,
        )
      }

      if (file.dxid) {
        await this.closeFileOnPlatform(file.dxid, isChallengeBotFile)
      }

      file.state = FILE_STATE_DX.CLOSING

      await this.startFileSynchronization(fileUid, isChallengeBotFile, this.userCtx, followUpAction)
    })
  }

  /**
   * Synchronizes file state and returns true if the file is finalized (closed).
   * @param fileUid
   * @param isChallengeBotFile
   */
  async synchronizeFile(fileUid: Uid<'file'>, isChallengeBotFile: boolean): Promise<boolean> {
    this.logger.log(`Synchronize file: ${fileUid}`)
    const node = (await this.nodeRepo.findOneOrFail({ uid: fileUid })) as Asset | UserFile
    const platformClient = isChallengeBotFile ? this.challengeBotClient : this.userClient

    try {
      const fileDescribe = await platformClient.fileDescribe({
        fileDxid: node.dxid,
        projectDxid: node.project,
      })
      this.logger.log(`FileDescribe: ${JSON.stringify(fileDescribe)}`)
      if (fileDescribe.state === FILE_STATE_DX.CLOSED) {
        await this.handleFileClose(fileUid, this.userCtx.id, fileDescribe, node)
        return true
      }
      this.logger.log(`File ${fileUid} is not closed yet`)
    } catch (error) {
      this.logger.error(`Error calling platform ${error}`)
    }
    return false
  }

  async createFile(fileCreate: UserFileCreate): Promise<UserFile> {
    const file = new UserFile(this.em.getReference(User, fileCreate.userId))
    file.dxid = fileCreate.dxid
    file.project = fileCreate.project
    file.name = fileCreate.name
    file.state = fileCreate.state
    file.description = fileCreate.description
    file.parentType = fileCreate.parentType
    file.parentId = fileCreate.parentId
    file.scope = fileCreate.scope
    file.parentFolderId = fileCreate.parentFolderId
    file.scopedParentFolderId = fileCreate.scopedParentFolderId
    file.uid = `${fileCreate.dxid}-1`

    this.logger.log(`Creating file ${JSON.stringify(fileCreate)}`)
    await this.em.persistAndFlush(file)

    return file
  }

  async getDownloadLink(file: FileOrAsset, options?: DownloadLinkOptionsDto): Promise<string> {
    return this.entityService.getEntityDownloadLink(file, file.name, options)
  }

  /**
   * An asset cannot be deleted if it has an attached license and is associated with an app.
   *
   * @param assetToRemove
   */
  async validateAssetRemoval(assetToRemove: Asset): Promise<void> {
    await this.em.populate(assetToRemove, ['apps'])
    const licenseItems = await this.licensedItemRepo.getLicenseItemsForNode(assetToRemove.id)

    if (assetToRemove.apps.count() > 0 && licenseItems.length > 0) {
      throw new ValidationError(ASSET_VALIDATION_ERROR)
    }
  }

  async validateSpaceReports(fileToRemove: UserFile): Promise<void> {
    const count = await this.em.count(SpaceReport, { resultFile: fileToRemove })

    if (count > 0) {
      throw new DeleteRelationError('file', 'space report')
    }
  }

  private async mapFileInformation(file: UserFile, folderId: number): Promise<SelectedFile> {
    return {
      id: file.id,
      name: file.name,
      type: FILE_STI_TYPE.USERFILE,
      state: file.state as FILE_STATE,
      uid: file.uid,
      sourceScope: file.scope,
      sourceFolderId: folderId,
      sourceScopePath: file.folderPath,
    }
  }

  /**
   * List files and files in folders by selected node ids.
   * @param ids selected node ids
   * @returns
   */
  async listSelectedFiles(ids: number[]): Promise<SelectedNode[]> {
    const selectedNodes = await this.nodeRepo.findAccessible(
      { id: ids, stiType: { $in: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.FOLDER] } },
      {
        populate: ['parentFolder', 'scopedParentFolder'],
      },
    )
    if (!selectedNodes.length) return []

    const fileList = [] as SelectedNode[]
    for (const node of selectedNodes) {
      let nodePath = ''
      const parentFolder = userFileHelper.getParentFolder(node as UserFile)
      if (parentFolder) {
        nodePath = await userFileHelper.getNodePath(this.em, parentFolder)
      }
      node.folderPath = `${nodePath}/`
      if (node.isFile) {
        fileList.push(await this.mapFileInformation(node as UserFile, parentFolder?.id))
        continue
      }
      const children = [] as UserFile[]
      await this.nodeService.collectChildren(node as Folder, children)
      const folder = {
        id: node.id,
        name: node.name,
        sourceScope: node.scope,
        sourceFolderId: parentFolder?.id,
        sourceScopePath: node.folderPath,
        type: FILE_STI_TYPE.FOLDER,
        children: [],
      } as SelectedFolder
      for (const child of children) {
        if (child.isFile) {
          const folderId = child.scope.startsWith('space')
            ? child.scopedParentFolderId
            : child.parentFolderId
          folder.children.push(await this.mapFileInformation(child, folderId))
        }
      }
      fileList.push(folder)
    }
    return fileList
  }

  /**
   * Validate copying of selected files to target scope.
   * A file can only exist once in scope, so we need to check if the file is already there.
   * @param uids selected file uids
   * @param targetScope target scope
   * @returns
   */
  async validateCopyFiles(uids: Uid<'file'>[], targetScope: EntityScope): Promise<ExistingFileSet> {
    const existingFiles = {} as ExistingFileSet
    const user = await this.userCtx.loadEntity()
    const editableSpaces = await user.editableSpaces()
    const editableScopes = editableSpaces.map((space) => space.scope)
    if (targetScope !== 'private' && editableScopes.indexOf(targetScope as SpaceScope) === -1) {
      throw new PermissionError('You do not have permission to copy files to this scope')
    }

    const uidsMap: Map<DxId<'file'>, string> = new Map()
    uids.forEach((uid) => {
      const lastDashIndex = uid.lastIndexOf('-')
      const dxid = uid.substring(0, lastDashIndex) as DxId<'file'>
      uidsMap.set(dxid, uid)
    })

    // Fetch all relevant files in a single query
    const dxids = Array.from(uidsMap.keys())
    const checkedFiles = await this.fileRepo.findEditable({
      dxid: { $in: dxids },
      scope: targetScope,
    })

    const fileMap: Map<DxId<'file'>, UserFile> = new Map()
    checkedFiles.forEach((file) => {
      fileMap.set(file.dxid, file)
    })

    await Promise.all(
      checkedFiles.map(async (file) => {
        const uid = uidsMap.get(file.dxid)
        if (file) {
          existingFiles[uid] = {
            uid: file.uid,
            targetScopePath: await userFileHelper.getNodePath(this.em, file),
          }
        }
      }),
    )

    return { ...existingFiles }
  }

  /**
   * Validates for Protected Spaces. If node is in protected space then
   * given userId needs to be in a lead role otherwise error is thrown.
   *
   * @param action action that is to be performed on the node (for possible validation error message)
   * @param userId current user
   * @param node node that is being verified
   */
  async validateProtectedSpaces(action: string, userId: number, node: Node): Promise<void> {
    if (!node.isInSpace()) {
      return
    }

    const spaceId = node.getSpaceId()
    const space = await this.spaceRepo.findOne(spaceId, {
      populate: ['spaceMemberships', 'spaceMemberships.user'],
    })

    if (!space.protected) {
      return
    }

    const isLeadMember = space.spaceMemberships
      .getItems()
      .some(
        (membership) =>
          membership.role === SPACE_MEMBERSHIP_ROLE.LEAD && membership.user.id === userId,
      )

    if (!isLeadMember) {
      throw new Error(`You have no permissions to ${action} from a Protected Space`)
    }
  }
}
