import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

export class DiscussionReplyDTO {
  id: number
  discussionId: number
  title: string
  content: string
  noteId: number
  user: SimpleUserDTO
  // comments: DiscussionReplyDTO[]
  createdAt: Date
  updatedAt: Date

  static async fromEntity(reply: DiscussionReply): Promise<DiscussionReplyDTO> {
    const dto = new DiscussionReplyDTO()
    // PFDA-5997 - part 1: keep return old comment id
    dto.id = reply.replyType === DISCUSSION_REPLY_TYPE.ANSWER ? reply.id : reply.oldComment.id
    dto.discussionId = reply.discussion.id
    const note = await reply.note.load()
    dto.noteId = note.id
    dto.title = note.title
    dto.content = note.content
    dto.user = SimpleUserDTO.fromEntity(await reply.user.load())
    // dto.comments = []
    // if (reply.comments.isInitialized()) {
    //   dto.comments = await Promise.all(reply.comments.getItems().map(DiscussionReplyDTO.fromEntity))
    // }
    dto.createdAt = reply.createdAt
    dto.updatedAt = reply.updatedAt
    return dto
  }
}
