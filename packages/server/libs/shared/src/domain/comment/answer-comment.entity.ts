import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Answer } from '@shared/domain/answer/answer.entity'
import { User } from '@shared/domain/user/user.entity'
import { Comment } from '@shared/domain/comment/comment.entity'

@Entity({ discriminatorValue: 'Answer' })
export class AnswerComment extends Comment {
  @ManyToOne({ entity: () => Answer, fieldName: 'commentable_id' })
  commentableId: Ref<Answer>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Answer'
  }
}
