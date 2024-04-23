import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NotFoundError, PermissionError, ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { FileDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { UserCtx } from '@shared/types'
import { FOLLOW_UP_ACTION } from '../user-file.input'
import {
  BulkDownloadFiles,
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STI_TYPE,
  IFileOrAsset,
} from '../user-file.types'
import { createFileSynchronizeJobTask } from '@shared/queue'
import { UserFileCreate } from '../domain/user-file-create'
import { UserFile } from '../user-file.entity'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import * as eventHelper from '@shared/domain/event/event.helper'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { TimeUtils } from '@shared/utils/time.utils'
import { NodeHelper } from '@shared/domain/user-file/node.helper'

@Injectable()
export class UserFileService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly logger: Logger,
    private readonly userClient: PlatformClient,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT) private readonly challengeBotClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly nodeRepo: NodeRepository,
    private readonly fileRepo: UserFileRepository,
    private readonly userRepo: UserRepository,
    private readonly resourceRepo: ResourceRepository,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly nodeHelper: NodeHelper,
  ) {}

  /**
   * Loads file and returns it if the user is allowed to close it.
   * Returns the node with a boolean flag indicating if it's a challenge file.
   *
   * Note: works for both UserFile and Asset
   * @param user User with populated spaceMemberships and spaceMemberships.spaces
   * @param fileUid
   * @private
   */
  private async getFile(user: User, fileUid: string): Promise<[Node, boolean]> {
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
    this.logger.verbose({ fileDxid }, 'UserFileService: Calling close file on platform')
    const platformClient = challengeBotFile ? this.challengeBotClient : this.userClient
    const response = await platformClient.fileClose({
      fileDxid,
    })
    this.logger.verbose({ response }, 'UserFileService: File close response')
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
    this.logger.verbose(`UserFileService: file ${fileUid} is closed`)
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
      this.logger.error(`Error creating notification ${error}`)
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

  async closeFile(fileUid: string, followUpAction?: FOLLOW_UP_ACTION) {
    this.logger.verbose(`UserFileService: closing file ${fileUid}`)

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
  async synchronizeFile(fileUid: string, isChallengeBotFile: boolean): Promise<boolean> {
    this.logger.verbose(`UserFileService: synchronize file: ${fileUid}`)
    const node = await this.nodeRepo.findOneOrFail({ uid: fileUid })
    const platformClient = isChallengeBotFile ? this.challengeBotClient : this.userClient

    try {
      const fileDescribe = await platformClient.fileDescribe({
        fileDxid: node.dxid,
        projectDxid: node.project,
      })
      this.logger.verbose(`UserFileService: fileDescribe: ${JSON.stringify(fileDescribe)}`)
      if (fileDescribe.state === FILE_STATE_DX.CLOSED) {
        await this.handleFileClose(fileUid, this.user.id, fileDescribe, node)
        return true
      }
      this.logger.verbose(`UserFileService: file ${fileUid} is not closed yet`)
    } catch (error) {
      this.logger.error(`Error calling platform ${error}`)
    }
    return false
  }

  async updateResourceUrl(fileUid: string) {
    this.logger.verbose(`UserFileService: updating url for fileUid ${fileUid}`)

    const resources = await this.resourceRepo.findResourcesByFileUid(fileUid)
    if (resources.length === 0) {
      throw new NotFoundError(`Resource for fileUid ${fileUid} was not found`)
    }
    const resource = resources[0]
    const userFile = resource.userFile.getEntity()

    const response = await this.userClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9999999999,
    })
    resource.url = response.url
    this.logger.verbose(
      `UserFileService: resource with id ${resource.id} updated with url ${response.url}`,
    )
    await this.em.flush()

    try {
      await this.notificationService.createNotification({
        message: `Resource ${resource.id} updated with url ${response.url}`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.RESOURCE_URL_UPDATED,
        userId: this.user.id,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
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
}
