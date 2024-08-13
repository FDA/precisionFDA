import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import {
  CliAppDescribeDTO,
  CliDiscussionDescribeDTO,
  CliExecutionDescribeDTO,
  CliFileDescribeDTO,
  CliWorkflowDescribeDTO,
} from '@shared/domain/cli/dto/CliDescribeDTO'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/CliDiscussionDTO'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/CliSpaceMemberDTO'
import {
  AnswerDTO,
  DiscussionAttachment,
  DiscussionDTO,
} from '@shared/domain/discussion/discussion.types'
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
import { NotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { SCOPE } from '@shared/types/common'

@Injectable()
export class CliService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly discussionService: DiscussionService,
    private readonly platformClient: PlatformClient,
  ) {}

  /**
   * entity can be one of: file, asset - also file, app, workflow, job.
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
      default:
        throw new Error('Entity not found')
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

    return CliFileDescribeDTO.mapToDTO(describeFile, file)
  }

  private async describeWorkflow(uid: Uid<'workflow'>) {
    const workflow = await this.entityFetcherService.getAccessibleByUid(Workflow, uid)
    if (!workflow) {
      throw new NotFoundError('Workflow not found or not accessible')
    }
    const platformWorkflowData = await this.platformClient.workflowDescribe({
      dxid: workflow.dxid,
    })

    return CliWorkflowDescribeDTO.mapToDTO(platformWorkflowData, workflow)
  }

  private async describeApp(entityId: Uid<'app'>) {
    const app = await this.entityFetcherService.getAccessibleByUid(App, entityId)
    if (!app) {
      throw new NotFoundError('App not found or not accessible')
    }
    const platformAppData = await this.platformClient.appDescribe({
      dxid: app.dxid,
    })

    return CliAppDescribeDTO.mapToDTO(platformAppData, app)
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
    return CliExecutionDescribeDTO.mapToDTO(platformExecutionData, execution)
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
      memberships.map((membership) => CliSpaceMemberDTO.mapToDTO(membership)),
    )
  }

  async listSpaceDiscussions(spaceId: number) {
    const discussions = await this.discussionService.getDiscussions(`space-${spaceId}`)

    return discussions.map((d: DiscussionDTO) => {
      return CliDiscussionDTO.mapToDTO(d)
    })
  }

  async describeDiscussion(discussionId: number) {
    const discussion = await this.discussionService.getDiscussion(discussionId)
    const attachments = await this.discussionService.getAttachments(discussion.note.id)

    const result: CliDiscussionDescribeDTO = {
      id: discussion.id,
      title: discussion.note.title,
      content: discussion.note.content,
      user: discussion.user,
      comments: discussion.comments,
      commentsCount: discussion.commentsCount,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      answers: await Promise.all(
        discussion.answers.map(async (answer: AnswerDTO) => {
          return {
            ...answer,
            attachments: await this.discussionService
              .getAttachments(answer.note.id)
              .then((attachments) => {
                return attachments.map((attachment: DiscussionAttachment) => {
                  return {
                    uid: attachment.uid,
                    type: attachment.type,
                    name: attachment.name,
                  }
                })
              }),
          }
        }),
      ),
      answersCount: discussion.answersCount,
      attachments: attachments.map((attachment: DiscussionAttachment) => {
        return {
          uid: attachment.uid,
          type: attachment.type,
          name: attachment.name,
        }
      }),
    }

    return result
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
        $and: [{ id: arg as any }, { stiType: FILE_STI_TYPE.FOLDER }],
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
}
