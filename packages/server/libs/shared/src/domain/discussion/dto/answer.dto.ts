import { Answer } from '@shared/domain/answer/answer.entity'
import { CommentDTO } from './comment.dto'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

export class AnswerDTO {
  id: number
  discussionId: number
  title: string
  content: string
  noteId: number
  user: SimpleUserDTO
  comments: CommentDTO[]
  createdAt: Date
  updatedAt: Date

  static async fromEntity(answer: Answer): Promise<AnswerDTO> {
    const dto = new AnswerDTO()
    dto.id = answer.id
    dto.discussionId = answer.discussion.id
    const note = await answer.note.load()
    dto.noteId = note.id
    dto.title = note.title
    dto.content = note.content
    dto.user = SimpleUserDTO.fromEntity(await answer.user.load())
    dto.comments = await Promise.all(answer.comments.getItems().map(CommentDTO.fromEntity))
    dto.createdAt = answer.createdAt
    dto.updatedAt = answer.updatedAt
    return dto
  }
}
