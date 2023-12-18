import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Comment } from '.'
import { Answer } from '../answer'
import { User } from '../user'

@Entity({ discriminatorValue: 'Answer' })
export class AnswerComment extends Comment {
  @ManyToOne({ entity: () => Answer, fieldName: 'commentable_id' })
    commentableId: Ref<Answer>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Answer'
  }
}
