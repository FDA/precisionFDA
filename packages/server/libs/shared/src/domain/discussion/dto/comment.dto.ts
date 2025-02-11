import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

export class CommentDTO {
  id: number
  createdAt: Date
  updatedAt: Date
  commentableId: number
  commentableType: string
  body: string
  user: SimpleUserDTO

  static async fromEntity(comment: AnswerComment | DiscussionComment): Promise<CommentDTO> {
    const dto = new CommentDTO()
    dto.id = comment.id
    dto.createdAt = comment.createdAt
    dto.updatedAt = comment.updatedAt
    dto.commentableId = comment.commentableId.id
    dto.commentableType = comment.commentableType
    dto.body = comment.body
    dto.user = SimpleUserDTO.fromEntity(await comment.user.load())

    return dto
  }
}
