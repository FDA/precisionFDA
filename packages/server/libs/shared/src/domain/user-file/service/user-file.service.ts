import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { UId } from '@shared/domain/entity/domain/uid'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import * as eventHelper from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import {
  DeleteRelationError,
  FolderNotFoundError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { FileDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { createFileSynchronizeJobTask } from '@shared/queue'
import { UserCtx } from '@shared/types'
import { TimeUtils } from '@shared/utils/time.utils'
import { UserFileCreate } from '../domain/user-file-create'
import { UserFile } from '../user-file.entity'
import { FOLLOW_UP_ACTION } from '../user-file.input'
import {
  BulkDownloadFiles,
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STI_TYPE,
  IFileOrAsset,
} from '../user-file.types'
import {
  getNodePath,
  getSuccessMessage,
  loadNodes,
  validateEditableBy,
  validateProtectedSpaces,
  validateVerificationSpace,
} from '@shared/domain/user-file/user-file.helper'
import { TypeUtils } from '@shared/utils/type-utils'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { createFileEvent, createFolderEvent, EVENT_TYPES } from '@shared/domain/event/event.helper'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { ComparisonInput } from '@shared/domain/comparison-input/comparison-input.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'

@Injectable()
export class UserFileService {
  @ServiceLogger()
  private readonly log: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userClient: PlatformClient,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT) private readonly challengeBotClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly nodeRepo: NodeRepository,
    private readonly fileRepo: UserFileRepository,
    private readonly folderRepo: FolderRepository,
    private readonly userRepo: UserRepository,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly nodeHelper: NodeHelper,
    private readonly entityService: EntityService,
    private readonly taggingService: TaggingService,
    private readonly spaceEventService: SpaceEventService,
  ) {}

  /**
   * Removes all files and folders specified by id in input. Operation traverses
   * also through children.
   * @param ids
   * @param async
   */
  async removeNodes(ids: number[], async: boolean) {
    this.log.verbose(ids, 'Removing ids')
    const nodes: Node[] = await loadNodes(this.em, { ids }, {})

    let removedFilesCount = 0
    let removedFoldersCount = 0

    try {
      // required because of a bug in the orm, where an entity fetched as part of a related collection to a different entity gets inserted back into the database in case it is deleted in very specific situations.
      // this might get fixed in the future in the ORM and therefore the clear might not be needed anymore
      // see JIRA PFDA-5169 for reproduction steps
      this.em.clear()

      for (const node of nodes) {
        if (node.stiType === FILE_STI_TYPE.USERFILE) {
          await this.removeFile(node.id)
          removedFilesCount++
        } else {
          await this.removeFolder(node.id)
          removedFoldersCount++
        }
      }

      if (async) {
        await this.notificationService.createNotification({
          message: getSuccessMessage(
            removedFilesCount,
            removedFoldersCount,
            'Successfully deleted',
          ),
          severity: SEVERITY.INFO,
          action: NOTIFICATION_ACTION.NODES_REMOVED,
          userId: this.user.id,
        })
      }

      this.log.verbose(
        { foldersCount: removedFoldersCount, filesCount: removedFilesCount },
        'Removed total objects',
      )
    } catch (err) {
      if (async) {
        await this.notificationService.createNotification({
          message:
            TypeUtils.getPropertyValueFromUnknownObject<string>(err, 'message') ??
            'Error deleting files and folders.',
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.NODES_REMOVED,
          userId: this.user.id,
        })

        await this.rollbackRemovingState(nodes)
      }

      if (err.message !== 'Locked items cannot be removed.') {
        throw new Error('Failed to remove nodes')
      }
    }
    return removedFilesCount + removedFoldersCount
  }

  async removeFolder(id: number) {
    const folderToRemove = await this.folderRepo.findOne(id)

    folderToRemove &&
      (await validateProtectedSpaces(this.em, 'remove', this.user.id, folderToRemove))

    if (!folderToRemove) {
      throw new FolderNotFoundError()
    }

    await folderToRemove.children.init()
    if (folderToRemove.children.length > 0) {
      throw new Error(
        `Cannot remove folder ${folderToRemove.name} with children. Remove children first.`,
      )
    }
    const user = await this.userRepo.findOneOrFail(this.user.id)

    await validateEditableBy(this.em, folderToRemove, user)
    await validateVerificationSpace(this.em, folderToRemove)

    const folderPath = await getNodePath(this.em, folderToRemove)

    return await this.em.transactional(async () => {
      await this.taggingService.removeTaggings(folderToRemove.id)

      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_DELETED,
        folderToRemove,
        folderPath,
        user,
      )

      this.em.persist(folderEvent)
      this.em.remove(folderToRemove)
      this.log.verbose(`Removed folder ${folderToRemove.name}`)
      return 1
    })
  }

  async removeFile(id: number) {
    this.log.verbose(`Removing file with id: ${id}`)

    const user = await this.userRepo.findOneOrFail(this.user.id)
    const fileToRemove = await this.fileRepo.findOneOrFail(id)

    await this.validateComparisons(fileToRemove)
    await validateEditableBy(this.em, fileToRemove, user)
    await validateVerificationSpace(this.em, fileToRemove)
    await validateProtectedSpaces(this.em, 'remove', this.user.id, fileToRemove)
    await this.validateSpaceReports(fileToRemove)

    const lastNode = (await this.fileRepo.count({ dxid: fileToRemove.dxid })) === 1
    const filePath = await getNodePath(this.em, fileToRemove)

    return await this.em.transactional(async () => {
      await this.taggingService.removeTaggings(fileToRemove.id)

      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        fileToRemove,
        filePath,
        user,
      )
      this.em.persist(fileEvent)

      if (lastNode) {
        // we're deleting from platform only if it's the last with given dxid
        await this.userClient.fileRemove({
          projectId: fileToRemove.project,
          ids: [fileToRemove.dxid],
        })
      }

      if (fileToRemove.scope && fileToRemove.scope.startsWith('space')) {
        const spaceId = getIdFromScopeName(fileToRemove.scope)
        await this.spaceEventService.createSpaceEvent({
          entity: { type: 'userFile', value: fileToRemove },
          spaceId,
          userId: this.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        })
      }

      this.em.remove(fileToRemove)
      this.log.verbose(`UserFileService: Removed file ${fileToRemove.name}`)
      return 1
    })
  }

  /**
   * Loads file and returns it if the user is allowed to close it.
   * Returns the node with a boolean flag indicating if it's a challenge file.
   *
   * Note: works for both UserFile and Asset
   * @param user User with populated spaceMemberships and spaceMemberships.spaces
   * @param fileUid
   * @private
   */
  private async getFile(user: User, fileUid: UId): Promise<[Node, boolean]> {
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
    const file = await this.nodeRepo.loadIfAccessibleByUser(user, fileUid)
    if (!file) {
      throw new PermissionError(`User ${user.dxuser} does not have access to file ${fileUid}`)
    }
    return [file, false]
  }

  private async closeFileOnPlatform(fileDxid: string, challengeBotFile: boolean) {
    this.log.verbose({ fileDxid }, 'UserFileService: Calling close file on platform')
    const platformClient = challengeBotFile ? this.challengeBotClient : this.userClient
    const response = await platformClient.fileClose({
      fileDxid,
    })
    this.log.verbose({ response }, 'UserFileService: File close response')
  }

  private async startFileSynchronization(
    fileUid: string,
    isChallengeBotFile: boolean,
    userCtx: UserCtx,
    followUpAction?: FOLLOW_UP_ACTION,
  ) {
    await createFileSynchronizeJobTask({ fileUid, isChallengeBotFile, followUpAction }, userCtx)
  }

  private async handleFileClose(
    fileUid: string,
    userId: number,
    fileDescribe: FileDescribeResponse,
    node: Node,
  ) {
    this.log.verbose(`UserFileService: file ${fileUid} is closed`)
    node.state = fileDescribe.state as FILE_STATE
    node.fileSize = fileDescribe.size
    await this.em.flush()

    try {
      await this.notificationService.createNotification({
        message: `File ${node.name} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId,
      })
    } catch (error) {
      this.log.error(`Error creating notification ${error}`)
    }
  }

  private async getEnclosingFolderPath(tm: SqlEntityManager, folderId?: number) {
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
    const loadedUser: User = await this.userRepo.findOneOrFail(
      { id: this.user.id },
      { populate: ['spaceMemberships', 'spaceMemberships.spaces'] },
    )
    let nodes = await this.getAccessibleNodes(fileIDs)

    const warnings = this.nodeHelper.getWarningsForUnclosedFiles(nodes)
    if (warnings) {
      await this.notificationService.createNotification({
        message: warnings,
        severity: SEVERITY.WARN,
        action: NOTIFICATION_ACTION.DOWNLOAD_FILES_WARNING,
        userId: this.user.id,
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
    node: Node,
    loadedUser: User,
    enclosingFolderPath: string,
  ) {
    const filePath = await userFileHelper.getNodePath(tm, node)
    const fileDownloadLinkResponse = await this.userClient.fileDownloadLink({
      fileDxid: node.dxid,
      filename: node.name,
      project: node.project,
      duration: TimeUtils.daysToSeconds(1),
    })
    const fileEvent = await eventHelper.createFileEvent(
      eventHelper.EVENT_TYPES.FILE_BULK_DOWNLOAD,
      node as unknown as IFileOrAsset,
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

  private async getAccessibleNodes(fileIDs: number[]) {
    const nodes: Node[] = await userFileHelper.loadNodes(this.em, { ids: fileIDs }, {})
    const idsToCheck = nodes
      .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE)
      .map((node) => node.id)
    const accessibleNodes = await this.entityFetcherService.getAccessibleByIds(Node, idsToCheck)
    if (idsToCheck.length != accessibleNodes.length) {
      throw new PermissionError('You do not have permission to download all of these files')
    }
    return nodes
  }

  async closeFile(fileUid: UId, followUpAction?: FOLLOW_UP_ACTION) {
    this.log.verbose(`UserFileService: closing file ${fileUid}`)

    await this.em.transactional(async () => {
      const user = await this.userRepo.findOneOrFail(this.user.id, {
        populate: ['spaceMemberships', 'spaceMemberships.spaces'],
      })

      const [file, isChallengeBotFile] = await this.getFile(user, fileUid)

      if (file.state !== FILE_STATE_DX.OPEN) {
        throw new ValidationError(
          `File ${fileUid} is not in open state. Current state: "${file.state}"`,
        )
      }

      if (file.dxid) {
        await this.closeFileOnPlatform(file.dxid, isChallengeBotFile)
      }

      file.state = FILE_STATE_DX.CLOSING

      await this.startFileSynchronization(fileUid, isChallengeBotFile, this.user, followUpAction)
    })
  }

  /**
   * Synchronizes file state and returns true if the file is finalized (closed).
   * @param fileUid
   * @param isChallengeBotFile
   */
  async synchronizeFile(fileUid: UId, isChallengeBotFile: boolean): Promise<boolean> {
    this.log.verbose(`UserFileService: synchronize file: ${fileUid}`)
    const node = await this.nodeRepo.findOneOrFail({ uid: fileUid })
    const platformClient = isChallengeBotFile ? this.challengeBotClient : this.userClient

    try {
      const fileDescribe = await platformClient.fileDescribe({
        fileDxid: node.dxid,
        projectDxid: node.project,
      })
      this.log.verbose(`UserFileService: fileDescribe: ${JSON.stringify(fileDescribe)}`)
      if (fileDescribe.state === FILE_STATE_DX.CLOSED) {
        await this.handleFileClose(fileUid, this.user.id, fileDescribe, node)
        return true
      }
      this.log.verbose(`UserFileService: file ${fileUid} is not closed yet`)
    } catch (error) {
      this.log.error(`Error calling platform ${error}`)
    }
    return false
  }

  async createFile(fileCreate: UserFileCreate) {
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

    await this.em.persistAndFlush(file)

    return file
  }

  async getDownloadLink(file: UserFile, options?: DownloadLinkOptionsDto) {
    return this.entityService.getEntityDownloadLink(file, file.name, options)
  }

  async getDownloadLinkForUid(uid: UId, options?: DownloadLinkOptionsDto) {
    const file = await this.entityFetcherService.getAccessibleByUid(UserFile, uid)

    if (!file) {
      throw new NotFoundError('File not found')
    }

    return this.getDownloadLink(file, options)
  }

  private async rollbackRemovingState(nodes: Node[]) {
    this.log.error(`Rolling back removing state for nodes ${nodes.length}`)
    nodes.forEach((node) => {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        node.state = null
      } else {
        node.state = FILE_STATE_DX.CLOSED
      }
    })
    await this.em.persistAndFlush(nodes)
  }

  private async validateComparisons(fileToRemove: UserFile) {
    const result = await this.em.find(ComparisonInput, { userFile: fileToRemove })
    if (result && result.length > 0) {
      throw new Error(
        `File ${fileToRemove.name} cannot be deleted because it participates` +
          ' in one or more comparisons. Please delete all the comparisons first.',
      )
    }
  }

  private async validateSpaceReports(fileToRemove: UserFile) {
    const count = await this.em.count(SpaceReport, { resultFile: fileToRemove })

    if (count > 0) {
      throw new DeleteRelationError('file', 'space report')
    }
  }
}
