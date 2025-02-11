import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'

export class CliDiscussionDTO {
  id: number
  title: string
  user: SimpleUserDTO
  createdAt: Date
  updatedAt: Date
  answersCount: number
  commentsCount: number

  static mapToDTO(discussion: DiscussionDTO): CliDiscussionDTO {
    return {
      id: discussion.id,
      title: discussion.title,
      user: discussion.user,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      answersCount: discussion.answersCount,
      commentsCount: discussion.commentsCount,
    }
  }
}
