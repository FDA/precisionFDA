import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { SpaceScope } from '@shared/types/common'

@Entity({ discriminatorValue: 'Discussion' })
export class DiscussionComment extends Comment {
  @ManyToOne({ entity: () => Discussion, fieldName: 'commentable_id' })
  commentable: Ref<Discussion>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Discussion'
  }

  async isEditableBy(user: User) {
    if (!user) {
      return false
    }

    if (this.user.id === user.id) {
      return true
    }

    const discussion = await this.commentable.load()
    const note = await discussion.note.load()
    if (note.isInSpace()) {
      const spaces = await user.editableSpaces()
      const scope = note.scope as SpaceScope

      return spaces.map((space) => space.scope).includes(scope)
    }

    if (note.isPublic()) {
      return user.isSiteAdmin()
    }
  }
}
