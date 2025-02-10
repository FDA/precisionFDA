import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { type DiscussionAttachment } from '@shared/domain/discussion/discussion.types'
import { AttachableEntityType } from '@shared/domain/discussion/model/attachable-entity.type'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import {
  SpaceReportPartDiscussionResult,
  SpaceReportPartDiscussionResultAnswer,
  SpaceReportPartDiscussionResultAttachment,
  SpaceReportPartDiscussionResultComment,
  SpaceReportPartDiscussionResultCommentCreatedBy,
} from '@shared/domain/space-report/model/space-report-part-discussion-result'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

@Injectable()
export class SpaceReportPartDiscussionResultProviderService extends SpaceReportPartResultProvider<'discussion'> {
  private readonly ATTACHMENT_TYPE_TO_ENTITY_TYPE_MAP: Record<
    DiscussionAttachment['type'],
    AttachableEntityType
  > = {
    App: 'app',
    UserFile: 'file',
    Folder: 'folder',
    Asset: 'asset',
    Job: 'job',
    Comparison: 'comparison',
  }

  constructor(private readonly discussionService: DiscussionService) {
    super()
  }

  protected async getJsonResult(entity: Discussion) {
    return this.getHtmlResult(entity)
  }

  protected async getHtmlResult(entity: Discussion): Promise<SpaceReportPartDiscussionResult> {
    const discussion = await this.discussionService.getDiscussion(entity.id)
    const attachments = await this.discussionService.getAttachments(entity.note.id)

    return {
      title: discussion.title,
      content: discussion.content,
      createdBy: this.mapCreatedBy(discussion.user),
      createdAt: discussion.createdAt,
      answers: await Promise.all(discussion.answers.map((a) => this.mapAnswer(a))),
      comments: discussion.comments.map((c) => this.mapComment(c)),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private async mapAnswer(answer: AnswerDTO): Promise<SpaceReportPartDiscussionResultAnswer> {
    const attachments = await this.discussionService.getAttachments(answer.noteId)

    return {
      content: answer.content,
      createdBy: this.mapCreatedBy(answer.user),
      createdAt: answer.createdAt,
      comments: answer.comments.map((c) => this.mapComment(c)),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private mapComment(comment: CommentDTO): SpaceReportPartDiscussionResultComment {
    return {
      content: comment.body,
      createdAt: comment.createdAt,
      createdBy: this.mapCreatedBy(comment.user),
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

  private mapCreatedBy(user: SimpleUserDTO): SpaceReportPartDiscussionResultCommentCreatedBy {
    return {
      fullName: user.fullName,
      dxuser: user.dxuser,
    }
  }
}
