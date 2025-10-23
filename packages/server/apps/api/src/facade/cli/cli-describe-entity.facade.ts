import { Uid } from '@shared/domain/entity/domain/uid'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import {
  CliAnswerDTO,
  CliAppDescribeDTO,
  CliCommentDTO,
  CliDbClusterDescribeDTO,
  CliDiscussionDescribeDTO,
  CliExecutionDescribeDTO,
  CliFileDescribeDTO,
  CliFolderDescribeDTO,
  CliWorkflowDescribeDTO,
} from '@shared/domain/cli/dto/cli-describe.dto'
import { AppRepository } from '@shared/domain/app/app.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import WorkflowRepository from '@shared/domain/workflow/entity/workflow.repository'
import { PlatformClient } from '@shared/platform-client'
import { DiscussionAttachment } from '@shared/domain/discussion/discussion.types'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { Injectable } from '@nestjs/common'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { NodeHelper } from '@shared/domain/user-file/node.helper'

@Injectable()
export class CliDescribeEntityFacade {
  constructor(
    private readonly userFileRepository: UserFileRepository,
    private readonly assetRepository: AssetRepository,
    private readonly folderRepository: FolderRepository,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly dbclusterRepository: DbClusterRepository,
    private readonly platformClient: PlatformClient,
    private readonly attachmentsFacade: AttachmentManagementFacade,
    private readonly discussionService: DiscussionService,
    private readonly nodeHelper: NodeHelper,
  ) {}

  /**
   * entity can be one of: file, asset - also file, app, workflow, job, discussion.
   * Consolidating both pFDA and platform data for the response.
   * @param uid - UID of the entity to describe
   */
  async describeEntity(
    uid: string,
  ): Promise<
    | CliFileDescribeDTO
    | CliDiscussionDescribeDTO
    | CliFolderDescribeDTO
    | CliWorkflowDescribeDTO
    | CliAppDescribeDTO
    | CliExecutionDescribeDTO
    | CliDbClusterDescribeDTO
  > {
    switch (uid.split('-')[0]) {
      case 'file':
        return await this.describeFile(uid as Uid<'file'>)
      case 'workflow':
        return await this.describeWorkflow(uid as Uid<'workflow'>)
      case 'app':
        return await this.describeApp(uid as Uid<'app'>)
      case 'job':
        return await this.describeExecution(uid as Uid<'job'>)
      case 'discussion':
        return await this.describeDiscussion(parseInt(uid.split('-')[1]))
      case 'folder':
        return await this.describeFolder(parseInt(uid.split('-')[1]))
      case 'dbcluster':
        return await this.describeDbCluster(uid as Uid<'dbcluster'>)
      default:
        throw new InvalidStateError('Unsupported entity type!')
    }
  }

  private async describeFile(entityId: Uid<'file'>): Promise<CliFileDescribeDTO> {
    // Try to find as user file
    let file: FileOrAsset = await this.userFileRepository.findAccessibleOne(
      { uid: entityId },
      { populate: ['taggings.tag', 'user'] },
    )

    // If not found, try as asset
    if (!file) {
      file = await this.assetRepository.findOne({ uid: entityId }, { populate: ['taggings.tag'] })
    }

    if (!file) {
      throw new NotFoundError('File or asset not found or not accessible')
    }

    const describeFile = await this.platformClient.fileDescribe(
      {
        fileDxid: file.dxid,
        projectDxid: file.project,
      },
      {},
    )

    await file.properties.loadItems()
    return CliFileDescribeDTO.fromEntity(describeFile, file)
  }

  private async describeFolder(id: number): Promise<CliFolderDescribeDTO> {
    const folder = await this.folderRepository.findAccessibleOne({ id })
    if (!folder) {
      throw new NotFoundError('Folder not found or not accessible')
    }
    const path = await this.nodeHelper.getNodePath(folder)
    return CliFolderDescribeDTO.fromEntity(folder, path)
  }

  private async describeWorkflow(uid: Uid<'workflow'>): Promise<CliWorkflowDescribeDTO> {
    const workflow = await this.workflowRepository.findAccessibleOne({ uid })
    if (!workflow) {
      throw new NotFoundError('Workflow not found or not accessible')
    }
    const platformWorkflowData = await this.platformClient.workflowDescribe({
      dxid: workflow.dxid,
    })

    return CliWorkflowDescribeDTO.fromEntity(platformWorkflowData, workflow)
  }

  private async describeApp(entityId: Uid<'app'>): Promise<CliAppDescribeDTO> {
    const app = await this.appRepository.findAccessibleOne({ uid: entityId })
    if (!app) {
      throw new NotFoundError('App not found or not accessible')
    }
    const platformAppData = await this.platformClient.appDescribe({
      dxid: app.dxid,
    })

    return CliAppDescribeDTO.fromEntity(platformAppData, app)
  }

  private async describeExecution(entityId: Uid<'job'>): Promise<CliExecutionDescribeDTO> {
    const execution = await this.jobRepository.findAccessibleOne(
      { uid: entityId },
      // needed when the job is described by non-owner
      { populate: ['user'] },
    )

    if (!execution) {
      throw new NotFoundError('Execution not found or not accessible')
    }

    const platformExecutionData = await this.platformClient
      .jobDescribe({ jobId: execution.dxid })
      .catch((err) => {
        if (err.props.clientStatusCode === 401) {
          return execution.describe
        }
        throw err
      })
    return CliExecutionDescribeDTO.fromEntity(platformExecutionData, execution)
  }

  async describeDiscussion(discussionId: number): Promise<CliDiscussionDescribeDTO> {
    const discussion = await this.discussionService.getDiscussion(discussionId)
    const attachments = await this.fetchAttachments(discussion.noteId)

    return {
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      user: discussion.user,
      comments: this.mapComments(discussion.comments),
      commentsCount: discussion.commentsCount,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      answers: await this.mapAnswers(discussion.answers),
      answersCount: discussion.answersCount,
      attachments,
    }
  }

  async describeDbCluster(dbClusterUid: Uid<'dbcluster'>): Promise<CliDbClusterDescribeDTO> {
    const dbCluster = await this.dbclusterRepository.findAccessibleOne({ uid: dbClusterUid })
    if (!dbCluster) {
      throw new NotFoundError('Database cluster not found or not accessible')
    }

    const describeResult = await this.platformClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    return CliDbClusterDescribeDTO.fromEntity(describeResult, dbCluster)
  }

  private async fetchAttachments(noteId: number): Promise<
    {
      uid: string | number
      type: 'App' | 'UserFile' | 'Folder' | 'Asset' | 'Job' | 'Comparison'
      name: string
    }[]
  > {
    const attachments = await this.attachmentsFacade.getAttachments(noteId)
    return attachments.map((attachment: DiscussionAttachment) => ({
      uid: attachment.uid ?? attachment.id,
      type: attachment.type,
      name: attachment.name,
    }))
  }

  private mapComments(comments: CommentDTO[]): CliCommentDTO[] {
    return comments.map((comment) => ({
      id: comment.id,
      user: comment.user,
      content: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }))
  }

  private async mapAnswers(answers: AnswerDTO[]): Promise<CliAnswerDTO[]> {
    return Promise.all(
      answers.map(async (answer) => ({
        id: answer.id,
        user: answer.user,
        content: answer.content,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        comments: this.mapComments(answer.comments),
        attachments: await this.fetchAttachments(answer.noteId),
      })),
    )
  }
}
