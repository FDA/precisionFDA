import { Injectable, Logger } from '@nestjs/common'
import { AppService } from '@shared/domain/app/services/app.service'
import { DiscussionAttachmentTypeName } from '@shared/domain/attachment/attachment.types'
import { DiscussionAttachmentDTO } from '@shared/domain/attachment/dto/discussion-attachment.dto'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import { JobService } from '@shared/domain/job/job.service'
import { NoteService } from '@shared/domain/note/note.service'
import { NodeService } from '@shared/domain/user-file/node.service'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class AttachmentRetrieveFacade {
  @ServiceLogger()
  private readonly logger: Logger
  private readonly sourceTypeToServiceMap: Record<DiscussionAttachmentTypeName, object>

  constructor(
    private readonly noteService: NoteService,
    private readonly nodeService: NodeService,
    private readonly jobService: JobService,
    private readonly appService: AppService,
    private readonly comparisonService: ComparisonService,
    private readonly entityService: EntityService,
  ) {
    this.sourceTypeToServiceMap = {
      Node: this.nodeService,
      Job: this.jobService,
      App: this.appService,
      Comparison: this.comparisonService,
    } satisfies Record<DiscussionAttachmentTypeName, object>
  }

  async getAttachments(noteId: number): Promise<DiscussionAttachmentDTO[]> {
    this.logger.log(`Getting attachments for note id: ${noteId}`)
    const notes = await this.noteService.findAccessibleNotesAndAttachments([noteId])
    if (!notes?.length) {
      throw new NotFoundError('Unable to get attachments: note not found or insufficient permissions.')
    }

    const note = notes[0]
    const attachments: DiscussionAttachmentDTO[] = []
    for (const attachment of note.attachments) {
      const attachmentEntity = await this.sourceTypeToServiceMap[attachment.itemType].getAccessibleEntityById(
        attachment.itemId,
      )
      if (!attachmentEntity) {
        throw new NotFoundError('Unable to get attachments: attachment not found.')
      }
      const link = await this.entityService.getEntityUiLink(attachmentEntity)
      const discussionAttachment = DiscussionAttachmentDTO.fromEntity(attachmentEntity, link)
      attachments.push(discussionAttachment)
    }
    return attachments
  }

  async getAttachmentsByNoteIds(noteIds: number[]): Promise<Record<number, DiscussionAttachmentDTO[]>> {
    this.logger.log(`Getting attachments for discussion ids: ${noteIds.join(', ')}`)
    const notes = await this.noteService.findAccessibleNotesAndAttachments(noteIds)

    const attachmentsByDiscussion: Record<number, DiscussionAttachmentDTO[]> = {}
    for (const note of notes) {
      const attachments: DiscussionAttachmentDTO[] = []
      for (const attachment of note.attachments) {
        const attachmentEntity = await this.sourceTypeToServiceMap[attachment.itemType].getAccessibleEntityById(
          attachment.itemId,
        )
        if (!attachmentEntity) {
          throw new NotFoundError('Unable to get attachments: attachment not found.')
        }
        const link = await this.entityService.getEntityUiLink(attachmentEntity)
        const discussionAttachment = DiscussionAttachmentDTO.fromEntity(attachmentEntity, link)
        attachments.push(discussionAttachment)
      }
      if (attachments.length > 0) {
        attachmentsByDiscussion[note.id] = attachments
      }
    }
    return attachmentsByDiscussion
  }
}
