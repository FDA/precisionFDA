import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import {
  AnswerDTO,
  CommentDTO,
  type DiscussionAttachment,
} from '@shared/domain/discussion/discussion.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import {
  SpaceReportPartDiscussionResult,
  SpaceReportPartDiscussionResultAnswer,
  SpaceReportPartDiscussionResultAttachment,
  SpaceReportPartDiscussionResultComment,
} from '@shared/domain/space-report/model/space-report-part-discussion-result'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

@Injectable()
export class SpaceReportPartDiscussionResultProviderService
  implements SpaceReportPartResultProvider<'discussion'>
{
  private readonly ATTACHMENT_TYPE_TO_ENTITY_TYPE_MAP: Record<
    DiscussionAttachment['type'],
    EntityType
  > = {
    App: 'app',
    UserFile: 'file',
    Asset: 'asset',
    Job: 'job',
    Comparison: 'comparison',
  }

  constructor(private readonly discussionService: DiscussionService) {}

  async getResult(entity: Discussion): Promise<SpaceReportPartDiscussionResult> {
    const discussion = await this.discussionService.getDiscussion(entity.id)
    const attachments = await this.discussionService.getAttachments(entity.note.id)

    return {
      title: discussion.note.title,
      content: discussion.note.content,
      createdBy: discussion.user.fullName,
      createdAt: discussion.createdAt,
      answers: await Promise.all(discussion.answers.map((a) => this.mapAnswer(a))),
      comments: discussion.comments.map((c) => this.mapComment(c)),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private async mapAnswer(answer: AnswerDTO): Promise<SpaceReportPartDiscussionResultAnswer> {
    const attachments = await this.discussionService.getAttachments(answer.note.id)

    return {
      content: answer.note.content,
      createdBy: answer.user.fullName,
      createdAt: answer.createdAt,
      comments: answer.comments.map((c) => this.mapComment(c)),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private mapComment(comment: CommentDTO): SpaceReportPartDiscussionResultComment {
    return {
      content: comment.body,
      createdAt: comment.createdAt,
      createdBy: comment.user.fullName,
    }
  }

  private mapAttachment(
    attachment: DiscussionAttachment,
  ): SpaceReportPartDiscussionResultAttachment {
    return {
      name: attachment.name,
      link: attachment.link,
      type: this.ATTACHMENT_TYPE_TO_ENTITY_TYPE_MAP[attachment.type],
    }
  }
}
