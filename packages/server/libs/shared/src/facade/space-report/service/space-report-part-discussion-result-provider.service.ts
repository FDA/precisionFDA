import { Injectable } from '@nestjs/common'
import { DiscussionAttachmentDTO } from '@shared/domain/attachment/dto/discussion-attachment.dto'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { AttachableEntityType } from '@shared/domain/discussion/model/attachable-entity.type'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import {
  SpaceReportPartDiscussionResult,
  SpaceReportPartDiscussionResultAnswer,
  SpaceReportPartDiscussionResultAttachment,
  SpaceReportPartDiscussionResultComment,
  SpaceReportPartDiscussionResultCommentCreatedBy,
} from '@shared/domain/space-report/model/space-report-part-discussion-result'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { AttachmentRetrieveFacade } from '@shared/facade/discussion/attachment-retrieve.facade'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

@Injectable()
export class SpaceReportPartDiscussionResultProviderService extends SpaceReportPartResultProvider<'discussion'> {
  private readonly ATTACHMENT_TYPE_TO_ENTITY_TYPE_MAP: Record<
    DiscussionAttachmentDTO['type'],
    AttachableEntityType
  > = {
    App: 'app',
    UserFile: 'file',
    Folder: 'folder',
    Asset: 'asset',
    Job: 'job',
    Comparison: 'comparison',
  }

  constructor(
    private readonly discussionService: DiscussionService,
    private readonly attachmentRetrieveFacade: AttachmentRetrieveFacade,
  ) {
    super()
  }

  protected async getJsonResult(entity: Discussion): Promise<SpaceReportPartDiscussionResult> {
    return this.getHtmlResult(entity)
  }

  protected async getHtmlResult(entity: Discussion): Promise<SpaceReportPartDiscussionResult> {
    const discussion = await this.discussionService.getDiscussion(entity.id)
    const attachments = await this.attachmentRetrieveFacade.getAttachments(entity.note.id)

    return {
      title: discussion.title,
      content: discussion.content,
      createdBy: this.mapCreatedBy(discussion.user),
      createdAt: discussion.createdAt,
      answers: await Promise.all(discussion.answers.map((a) => this.mapAnswer(a))),
      comments: await Promise.all(discussion.comments.map((c) => this.mapComment(c))),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private async mapAnswer(
    answer: DiscussionReplyDTO,
  ): Promise<SpaceReportPartDiscussionResultAnswer> {
    const attachments = await this.attachmentRetrieveFacade.getAttachments(answer.noteId)

    return {
      content: answer.content,
      createdBy: this.mapCreatedBy(answer.user),
      createdAt: answer.createdAt,
      comments: await Promise.all(answer.comments.map((c) => this.mapComment(c))),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private async mapComment(
    comment: DiscussionReplyDTO,
  ): Promise<SpaceReportPartDiscussionResultComment> {
    const attachments = await this.attachmentRetrieveFacade.getAttachments(comment.noteId)

    return {
      content: comment.content,
      createdAt: comment.createdAt,
      createdBy: this.mapCreatedBy(comment.user),
      attachments: attachments.map((a) => this.mapAttachment(a)),
    }
  }

  private mapAttachment(
    attachment: DiscussionAttachmentDTO,
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
