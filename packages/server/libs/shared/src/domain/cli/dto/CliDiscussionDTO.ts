import { DiscussionDTO, UserDTO } from '@shared/domain/discussion/discussion.types'

export class CliDiscussionDTO {
  id: number
  title: string
  user: UserDTO
  createdAt: Date
  updatedAt: Date
  answersCount: number
  commentsCount: number

  static mapToDTO(discussion: DiscussionDTO): CliDiscussionDTO {
    return {
      id: discussion.id,
      title: discussion.note.title,
      user: discussion.user,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      answersCount: discussion.answersCount,
      commentsCount: discussion.commentsCount,
    }
  }
}
