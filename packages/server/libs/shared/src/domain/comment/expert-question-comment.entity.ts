import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Comment } from '@shared/domain/comment/comment.entity'
import { User } from '@shared/domain/user/user.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'

@Entity({ discriminatorValue: 'ExpertQuestion' })
export class ExpertQuestionComment extends Comment {
  @ManyToOne({ entity: () => ExpertQuestion, fieldName: 'commentable_id' })
  commentableId: Ref<ExpertQuestion>

  constructor(user: User) {
    super(user)
    this.commentableType = 'ExpertQuestion'
  }
}
