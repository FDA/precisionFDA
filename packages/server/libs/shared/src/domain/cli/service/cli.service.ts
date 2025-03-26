import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import {
  CliAppDescribeDTO,
  CliDbClusterDescribeDTO,
  CliDiscussionDescribeDTO,
  CliExecutionDescribeDTO,
  CliFileDescribeDTO,
  CliFolderDescribeDTO,
  CliWorkflowDescribeDTO,
} from '@shared/domain/cli/dto/CliDescribeDTO'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/CliDiscussionDTO'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/CliSpaceMemberDTO'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DiscussionAttachment } from '@shared/domain/discussion/discussion.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { getScopeFromSpaceId } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { SCOPE } from '@shared/types/common'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Answer } from '@shared/domain/answer/answer.entity'
import { CliEditDiscussionDTO } from '@shared/domain/cli/dto/cli-edit-discussion.dto'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { Comment } from '@shared/domain/comment/comment.entity'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { getNodePath } from '@shared/domain/user-file/user-file.helper'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { UpdateAnswerDTO } from '@shared/domain/discussion/dto/update-answer.dto'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'

@Injectable()
export class CliService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly dbclusterService: DbClusterService,
    private readonly discussionService: DiscussionService,
    private readonly platformClient: PlatformClient,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  /**
   * entity can be one of: file, asset - also file, app, workflow, job, discussion.
   * Consolidating both pFDA and platform data for the response.
   * @param uid - UID of the entity to describe
   */
  async describeEntity(uid: string) {
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

  private async describeFile(entityId: Uid<'file'>) {
    // why isn't the type Node ??
    // populate has to be here, I wasn't able to make it work otherwise.
    const file = await this.entityFetcherService.getAccessibleByUid(
      Node,
      entityId,
      {},
      { populate: ['taggings.tag', 'user'] },
    )
    if (!file) {
      throw new NotFoundError('File not found or not accessible')
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

  private async describeFolder(id: number) {
    const folder = await this.entityFetcherService.getAccessibleById(Folder, id)
    if (!folder) {
      throw new NotFoundError('Folder not found or not accessible')
    }
    const path = await getNodePath(this.em, folder)
    return CliFolderDescribeDTO.fromEntity(folder, path)
  }

  private async describeWorkflow(uid: Uid<'workflow'>) {
    const workflow = await this.entityFetcherService.getAccessibleByUid(Workflow, uid)
    if (!workflow) {
      throw new NotFoundError('Workflow not found or not accessible')
    }
    const platformWorkflowData = await this.platformClient.workflowDescribe({
      dxid: workflow.dxid,
    })

    return CliWorkflowDescribeDTO.fromEntity(platformWorkflowData, workflow)
  }

  private async describeApp(entityId: Uid<'app'>) {
    const app = await this.entityFetcherService.getAccessibleByUid(App, entityId)
    if (!app) {
      throw new NotFoundError('App not found or not accessible')
    }
    const platformAppData = await this.platformClient.appDescribe({
      dxid: app.dxid,
    })

    return CliAppDescribeDTO.fromEntity(platformAppData, app)
  }

  private async describeExecution(entityId: Uid<'job'>) {
    const execution = await this.entityFetcherService.getAccessibleByUid(
      Job,
      entityId,
      {},
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

  async describeDiscussion(discussionId: number) {
    const discussion = await this.discussionService.getDiscussion(discussionId)
    const attachments = await this.fetchAttachments(discussion.noteId)

    const result: CliDiscussionDescribeDTO = {
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

    return result
  }

  async describeDbCluster(dbClusterUid: Uid<'dbcluster'>) {
    const dbCluster = await this.entityFetcherService.getAccessibleByUid(
      DbCluster,
      dbClusterUid,
      {},
      { populate: ['taggings.tag', 'user', 'properties'] },
    )
    if (!dbCluster) {
      throw new NotFoundError('Database cluster not found or not accessible')
    }

    const describeResult = await this.platformClient.dbClusterDescribe({
      dxid: dbCluster.dxid,
      project: dbCluster.project,
    })

    return CliDbClusterDescribeDTO.fromEntity(describeResult, dbCluster)
  }

  private async fetchAttachments(noteId: number) {
    const attachments = await this.discussionService.getAttachments(noteId)
    return attachments.map((attachment: DiscussionAttachment) => ({
      uid: attachment.uid ?? attachment.id,
      type: attachment.type,
      name: attachment.name,
    }))
  }

  private mapComments(comments: CommentDTO[]) {
    return comments.map((comment) => ({
      id: comment.id,
      user: comment.user,
      content: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }))
  }

  private async mapAnswers(answers: AnswerDTO[]) {
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

  async listSpaceMembers(spaceId: number) {
    const space = await this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: { user: this.user.id },
    })
    if (!space) {
      throw new NotFoundError('Space does not exist or is not accessible')
    }
    const memberships = await this.em.find(
      SpaceMembership,
      { spaces: spaceId },
      {
        orderBy: {
          side: 'ASC',
          role: 'ASC',
        },
      },
    )

    return await Promise.all(
      memberships.map((membership) => CliSpaceMemberDTO.fromEntity(membership)),
    )
  }

  async listSpaceDiscussions(spaceId: number) {
    const response = await this.discussionService.listDiscussions({ scope: `space-${spaceId}` })

    return response.data.map((d: DiscussionDTO) => {
      return CliDiscussionDTO.mapToDTO(d)
    })
  }

  async getJobScope(jobDxid: DxId<'job'>) {
    const jobs: Job[] = await this.entityFetcherService.getAccessible('Job', { dxid: jobDxid })
    if (jobs.length !== 1) {
      throw new NotFoundError('Job not found or not accessible')
    }
    return { scope: jobs[0].scope }
  }

  async findNodes(input: CliNodeSearchDTO) {
    const { folderId, spaceId, arg, type } = input

    const parentFolder = !spaceId ? folderId : null
    const scope = spaceId ? getScopeFromSpaceId(spaceId) : STATIC_SCOPE.PRIVATE
    const scopedParentFolderId = spaceId ? folderId : null

    const spaces = await this.em.find(Space, {
      spaceMemberships: {
        user: { id: this.user.id },
        active: true,
        role: {
          $in: [
            SPACE_MEMBERSHIP_ROLE.ADMIN,
            SPACE_MEMBERSHIP_ROLE.LEAD,
            SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          ],
        },
      },
    })

    const spaceScopes = spaces.map((s) => `space-${s.id}`)
    if (spaceId && !spaceScopes.includes(scope)) {
      throw new PermissionError(
        "You don't have permission to access this space or remove files in it!",
      )
    }

    let result: UserFile[] | Folder[]

    if (type === 'Folder') {
      result = await this.em.find(Folder, {
        $or: [
          { userId: this.user.id, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: spaceScopes as SCOPE[] } },
        ],
        $and: [{ id: arg as unknown as number }, { stiType: FILE_STI_TYPE.FOLDER }],
      })

      for (const folder of result) {
        await folder.children.init()
      }
    } else {
      result = await this.em.find(UserFile, {
        $or: [
          { user: this.user.id, scope: STATIC_SCOPE.PRIVATE, parentFolder },
          { scope: { $in: spaceScopes as SCOPE[] }, scopedParentFolder: scopedParentFolderId },
        ],
        $and: [
          { name: { $like: arg } },
          { stiType: FILE_STI_TYPE.USERFILE },
          { scope: scope as SCOPE },
        ],
      })
    }

    return result
  }

  async dbClusterGetPassword(dbclusterUid: Uid<'dbcluster'>) {
    return await this.dbclusterService.getPassword(dbclusterUid)
  }

  async dbClusterRotatePassword(dbclusterUid: Uid<'dbcluster'>) {
    return await this.dbclusterService.rotatePassword(dbclusterUid)
  }

  async createDiscussion(spaceId: number, body: CliCreateDiscussionDTO) {
    const attachments = await this.transformAttachments(body.attachments)

    return await this.em.transactional(async () => {
      const result = await this.discussionService.createDiscussion({
        title: body.title,
        content: body.content,
        attachments,
        scope: `space-${spaceId}`,
        notify: [],
      })

      const newDiscussion = await this.em.findOne(Discussion, { id: result.id })
      return await this.entityLinkService.getUiLink(newDiscussion)
    })
  }

  async createReply(body: CliCreateReplyDTO) {
    // user can not reply with answer to answer
    if (body.answerId && body.discussionId) {
      throw new InvalidStateError('Cannot reply to both answer and discussion')
    }

    if (body.replyType === 'answer' && body.answerId) {
      throw new InvalidStateError('Cannot reply with answer to answer')
    }

    let result = null

    if (body.replyType === 'answer') {
      await this.em.transactional(async () => {
        const attachments = await this.transformAttachments(body.attachments)

        // permissions to the target are checked in the discussion service
        const answer = await this.discussionService.createAnswer({
          title: 'Answer',
          content: body.content,
          discussionId: body.discussionId,
          notify: [],
          attachments,
        })
        result = await this.em.findOne(Answer, { id: answer.id })
      })
    }

    if (body.replyType === 'comment') {
      const comment = await this.discussionService.createComment({
        ...body,
        notify: [],
      })

      result = await this.em.findOne(Comment, { id: comment.id })
    }

    return await this.entityLinkService.getUiLink(result)
  }

  async editDiscussion(discussionId: number, body: CliEditDiscussionDTO) {
    const newAttachments = await this.transformAttachments(body.attachments)

    const discussion = await this.entityFetcherService.getEditableById(Discussion, discussionId)
    if (!discussion) {
      throw new NotFoundError('Discussion not found or not accessible')
    }

    const note = await discussion.note.load()
    const existingAttachments = await this.discussionService.getAttachments(note.id)

    const attachments = {
      files: existingAttachments.filter((a) => a.type === 'UserFile').map((a) => a.id),
      folders: existingAttachments.filter((a) => a.type === 'Folder').map((a) => a.id),
      assets: existingAttachments.filter((a) => a.type === 'Asset').map((a) => a.id),
      apps: existingAttachments.filter((a) => a.type === 'App').map((a) => a.id),
      jobs: existingAttachments.filter((a) => a.type === 'Job').map((a) => a.id),
      comparisons: existingAttachments.filter((a) => a.type === 'Comparison').map((a) => a.id),
    }

    attachments.files.push(...newAttachments.files)
    attachments.folders.push(...newAttachments.folders)
    attachments.assets.push(...newAttachments.assets)
    attachments.apps.push(...newAttachments.apps)
    attachments.jobs.push(...newAttachments.jobs)
    attachments.comparisons.push(...newAttachments.comparisons)

    const updateDTO: UpdateDiscussionDTO = {
      title: note.title,
      content: body.content ? `${note.content}\n\n${body.content}` : note.content,
      attachments: attachments,
    }

    await this.discussionService.updateDiscussion(discussionId, updateDTO)
    return await this.entityLinkService.getUiLink(discussion)
  }

  async editReply(body: CliEditReplyDTO) {
    if (body.answerId && body.commentId) {
      throw new InvalidStateError('Cannot edit both answer and comment')
    }

    const targetType = body.answerId ? 'Answer' : 'Comment'
    const targetId = body.answerId ?? body.commentId

    const target = await this.em.findOne(targetType, { id: targetId, user: this.user.id })
    if (!target) {
      throw new NotFoundError('Reply not found or not accessible')
    }

    if (target instanceof Answer) {
      const newAttachments = await this.transformAttachments(body.attachments)
      const note = await target.note.load()
      const existingAttachments = await this.discussionService.getAttachments(note.id)
      const attachments = {
        files: existingAttachments.filter((a) => a.type === 'UserFile').map((a) => a.id),
        folders: existingAttachments.filter((a) => a.type === 'Folder').map((a) => a.id),
        assets: existingAttachments.filter((a) => a.type === 'Asset').map((a) => a.id),
        apps: existingAttachments.filter((a) => a.type === 'App').map((a) => a.id),
        jobs: existingAttachments.filter((a) => a.type === 'Job').map((a) => a.id),
        comparisons: existingAttachments.filter((a) => a.type === 'Comparison').map((a) => a.id),
      }

      attachments.files.push(...newAttachments.files)
      attachments.folders.push(...newAttachments.folders)
      attachments.assets.push(...newAttachments.assets)
      attachments.apps.push(...newAttachments.apps)
      attachments.jobs.push(...newAttachments.jobs)
      attachments.comparisons.push(...newAttachments.comparisons)

      const updateDTO: UpdateAnswerDTO = {
        content: body.content ? `${note.content}\n\n${body.content}` : note.content,
        attachments: attachments,
      }
      await this.discussionService.updateAnswer(target.id, updateDTO)
      return await this.entityLinkService.getUiLink(target)
    } else if (target instanceof Comment) {
      await this.discussionService.updateComment(target.id, body)
      return await this.entityLinkService.getUiLink(target)
    }
  }

  private async transformAttachments(body: CliAttachmentsDTO) {
    // transform attachments to the format expected by the discussion service
    const attachments = {
      files: [],
      folders: [],
      assets: [],
      apps: [],
      jobs: [],
      comparisons: [],
    }
    // iterate over uids and get ids instead - access rights are checked in discussion service.
    for (const uid of body.files) {
      const file = await this.entityFetcherService.getByUid(UserFile, uid)
      if (!file) {
        throw new NotFoundError(`File ${uid} not found or not accessible`)
      }
      attachments.files.push(file.id)
    }
    for (const id of body.folders) {
      attachments.folders.push(id)
    }
    for (const uid of body.assets) {
      const asset = await this.entityFetcherService.getByUid(Asset, uid)
      if (!asset) {
        throw new NotFoundError(`Asset ${uid} not found or not accessible`)
      }
      attachments.assets.push(asset.id)
    }
    for (const uid of body.apps) {
      const app = await this.entityFetcherService.getByUid(App, uid)
      if (!app) {
        throw new NotFoundError(`App ${uid} not found or not accessible`)
      }
      attachments.apps.push(app.id)
    }
    for (const uid of body.jobs) {
      const job = await this.entityFetcherService.getByUid(Job, uid)
      if (!job) {
        throw new NotFoundError(`Job ${uid} not found or not accessible`)
      }
      attachments.jobs.push(job.id)
    }
    for (const id of body.comparisons) {
      attachments.comparisons.push(id)
    }
    return attachments
  }
}
