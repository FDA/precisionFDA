import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { InternalError } from '@shared/errors'

export class DiscussionReplyDTO {
  id: number
  discussionId: number
  title: string
  content: string
  noteId: number
  user: SimpleUserDTO
  comments?: DiscussionReplyDTO[]
  createdAt: Date
  updatedAt: Date

  static fromEntity(reply: DiscussionReply): DiscussionReplyDTO {
    if (!reply.note.isInitialized()) {
      throw new InternalError('Note must be initialized')
    }
    if (!reply.user.isInitialized()) {
      throw new InternalError('User must be initialized')
    }
    const dto = new DiscussionReplyDTO()
    dto.id = reply.id
    dto.discussionId = reply.discussion.id
    const note = reply.note.getEntity()
    dto.noteId = note.id
    dto.title = note.title
    dto.content = note.content
    dto.user = SimpleUserDTO.fromEntity(reply.user.getEntity())
    dto.comments = []
    if (reply.comments?.isInitialized()) {
      dto.comments = reply.comments.getItems().map(DiscussionReplyDTO.fromEntity)
    }
    dto.createdAt = reply.createdAt
    dto.updatedAt = reply.updatedAt
    return dto
  }
}
