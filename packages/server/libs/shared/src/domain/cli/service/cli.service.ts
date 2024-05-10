import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import {
  CliAppDescribeDTO,
  CliDiscussionDescribeDTO,
  CliExecutionDescribeDTO,
  CliFileDescribeDTO,
  CliWorkflowDescribeDTO,
} from '@shared/domain/cli/dto/CliDescribeDTO'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/CliDiscussionDTO'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/CliSpaceMemberDTO'
import {
  AnswerDTO,
  DiscussionAttachment,
  DiscussionDTO,
} from '@shared/domain/discussion/discussion.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityFetcherService, UID } from '@shared/domain/entity/entity-fetcher.service'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { IFileOrAsset } from '@shared/domain/user-file/user-file.types'
import { NotFoundError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'

@Injectable()
export class CliService {

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly discussionService: DiscussionService,
    private readonly platformClient: PlatformClient,
  ) {
  }

  /**
   * entity can be one of: file, asset - also file, app, workflow, job.
   * Consolidating both pFDA and platform data for the response.
   * @param uid - UID of the entity to describe
   */
  async describeEntity(uid: string) {
    switch (uid.split('-')[0]) {
      case 'file':
        return await this.describeFile(uid as UID<'file'>)
      case 'workflow':
        return await this.describeWorkflow(uid as UID<'workflow'>)
      case 'app':
        return await this.describeApp(uid as UID<'app'>)
      case 'job':
        return await this.describeExecution(uid as UID<'job'>)
      default:
        throw new Error('Entity not found')
    }
  }

  private async describeFile(entityId: UID<'file'>) {
    // why isn't the type Node ??
    // populate has to be here, I wasn't able to make it work otherwise.
    //@ts-ignore
    const file: any = await this.entityFetcherService.getAccessibleByUid('Node', entityId, {}, { populate: ['taggings.tag', 'user'] })
    if (!file) {
      throw new NotFoundError('File not found or not accessible')
    }
    const describeFile = await this.platformClient.fileDescribe({
      fileDxid: file.dxid,
      projectDxid: null, // not needed - dxid is unique.
    }, {})

    await file.properties.loadItems()
    if (file.isAsset) {
      await file.archiveEntries.loadItems()
    }

    return CliFileDescribeDTO.mapToDTO(describeFile, file as IFileOrAsset)
  }

  private async describeWorkflow(uid: UID<'workflow'>) {
    const workflow: any = await this.entityFetcherService.getAccessibleByUid('Workflow', uid)
    if (!workflow) {
      throw new NotFoundError('Workflow not found or not accessible')
    }
    const platformWorkflowData = await this.platformClient.workflowDescribe({
      dxid: workflow.dxid,
    })

    return CliWorkflowDescribeDTO.mapToDTO(platformWorkflowData, workflow)
  }

  private async describeApp(entityId: UID<'app'>) {
    const app: any = await this.entityFetcherService.getAccessibleByUid('App', entityId)
    if (!app) {
      throw new NotFoundError('App not found or not accessible')
    }
    const platformAppData = await this.platformClient.appDescribe({
      dxid: app.dxid,
    })

    return CliAppDescribeDTO.mapToDTO(platformAppData, app)
  }

  private async describeExecution(entityId: UID<'job'>) {
    const execution: any = await this.entityFetcherService.getAccessibleByUid('Job', entityId)
    if (!execution) {
      throw new NotFoundError('Execution not found or not accessible')
    }

    const platformExecutionData = await this.platformClient.jobDescribe({ jobId: execution.dxid })
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
    const memberships = await this.em.find(SpaceMembership, { spaces: spaceId }, {
      orderBy: {
        side: 'ASC',
        role: 'ASC',
      },
    })

    return await Promise.all(memberships.map(membership => CliSpaceMemberDTO.mapToDTO(membership)))
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
      user: discussion.user,
      comments: discussion.comments,
      commentsCount: discussion.commentsCount,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      answers: await Promise.all(discussion.answers.map(async (answer: AnswerDTO) => {
        return {
          ...answer,
          attachments: await this.discussionService.getAttachments(answer.note.id).then((attachments) => {
            return attachments.map((attachment: DiscussionAttachment) => {
              return {
                uid: attachment.uid,
                type: attachment.type,
                name: attachment.name,
              }
            })
          }),
        }
      })),
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

  async getJobScope(jobDxid: string) {
    const jobs: Job[] = await this.entityFetcherService.getAccessible('Job', { dxid: jobDxid})
    if (jobs.length !== 1) {
      throw new NotFoundError('Job not found or not accessible')
    }
    return { scope: jobs[0].scope }
  }
}
