import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { EntityScope } from '@shared/types/common'
import { Discussion } from '../discussion.entity'

export class SimpleDiscussionDTO {
  id: number
  title: string
  scope: EntityScope
  user: SimpleUserDTO
  answersCount: number
  commentsCount: number
  createdAt: Date
  updatedAt: Date
  following: boolean

  static fromEntity(
    discussion: Discussion,
    following: boolean = false,
    answerCount: number,
    commentCount: number,
  ): SimpleDiscussionDTO {
    if (!discussion.note.isInitialized()) {
      throw new Error('Note must be initialized')
    }

    const dto = new SimpleDiscussionDTO()
    dto.id = discussion.id

    const note = discussion.note.getEntity()
    // take timestamps from note, because discussion can be updated only by updating note
    dto.createdAt = note.createdAt
    dto.updatedAt = note.updatedAt
    dto.title = note.title
    dto.scope = note.scope
    dto.answersCount = answerCount
    dto.commentsCount = commentCount

    if (discussion.user.isInitialized()) {
      dto.user = SimpleUserDTO.fromEntity(discussion.user.getEntity())
    }

    dto.following = following
    return dto
  }
}
