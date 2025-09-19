import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Comment } from '@shared/domain/comment/comment.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceScope } from '@shared/types/common'
import { Answer } from '../answer/answer.entity'

@Entity({ discriminatorValue: 'Answer' })
export class AnswerComment extends Comment {
  @ManyToOne({ entity: () => Answer, fieldName: 'commentable_id' })
  commentable: Ref<Answer>

  constructor(user: User) {
    super(user)
    this.commentableType = 'Answer'
  }

  async isEditableBy(user: User): Promise<boolean> {
    if (!user) {
      return false
    }

    if (this.user.id === user.id) {
      return true
    }

    const answer = await this.commentable.load()
    const note = await answer.note.load()
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
