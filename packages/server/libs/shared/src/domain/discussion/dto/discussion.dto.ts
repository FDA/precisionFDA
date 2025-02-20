import { EntityScope } from '@shared/types/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { AnswerDTO } from './answer.dto'
import { CommentDTO } from './comment.dto'

export class DiscussionDTO {
  id: number
  title: string
  content: string
  scope: EntityScope
  noteId: number
  user: SimpleUserDTO
  answers: AnswerDTO[]
  answersCount: number
  comments: CommentDTO[]
  commentsCount: number
  createdAt: Date
  updatedAt: Date

  static async fromEntity(discussion: Discussion): Promise<DiscussionDTO> {
    const dto = new DiscussionDTO()
    dto.id = discussion.id

    const note = discussion.note.getEntity()
    // take timestamps from note, because discussion can be updated only by updating note
    dto.createdAt = note.createdAt
    dto.updatedAt = note.updatedAt
    dto.noteId = note.id
    dto.title = note.title
    // would be nice to omit this when returning a list of discussions - can be thousands of characters not visible in the list component.
    dto.content = note.content
    dto.scope = note.scope
    dto.answersCount = await discussion.answers.loadCount()
    dto.commentsCount = await discussion.comments.loadCount()
    dto.user = SimpleUserDTO.fromEntity(discussion.user.getEntity())

    if (discussion.answers.isInitialized()) {
      dto.answers = await Promise.all(discussion.answers.getItems().map(AnswerDTO.fromEntity))
    } else {
      dto.answers = []
    }
    if (discussion.comments.isInitialized()) {
      dto.comments = await Promise.all(discussion.comments.getItems().map(CommentDTO.fromEntity))
    } else {
      dto.comments = []
    }
    return dto
  }
}
