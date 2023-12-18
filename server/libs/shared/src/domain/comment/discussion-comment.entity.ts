import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Discussion } from '../discussion'
import { User } from '../user'
import { Comment } from '.'


@Entity({ discriminatorValue: 'Discussion' })
export class DiscussionComment extends Comment {
  @ManyToOne({ entity: () => Discussion, fieldName: 'commentable_id' })
    commentableId: Ref<Discussion>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Discussion'
  }
}
