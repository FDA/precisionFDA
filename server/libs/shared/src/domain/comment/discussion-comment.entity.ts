import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { Comment } from '@shared/domain/comment/comment.entity'

@Entity({ discriminatorValue: 'Discussion' })
export class DiscussionComment extends Comment {
  @ManyToOne({ entity: () => Discussion, fieldName: 'commentable_id' })
    commentableId: Ref<Discussion>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Discussion'
  }
}
