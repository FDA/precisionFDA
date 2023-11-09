import { Entity, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import type { Answer } from '../answer'
import { User } from '../user'
import { Comment } from '.'

@Entity({ discriminatorValue: 'Answer' })
export class AnswerComment extends Comment {
  @ManyToOne({ fieldName: 'commentable_id' })
    commentableId: Ref<Answer>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Answer'
  }
}
