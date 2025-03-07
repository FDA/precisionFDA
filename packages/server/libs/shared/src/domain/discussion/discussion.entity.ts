import {
  Entity,
  Ref,
  ManyToOne,
  Reference,
  OneToOne,
  OneToMany,
  Collection,
  Property,
  Cascade,
} from '@mikro-orm/core'
import { Answer } from '@shared/domain/answer/answer.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Note } from '@shared/domain/note/note.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { SpaceScope } from '@shared/types/common'

@Entity({ tableName: 'discussions', repository: () => DiscussionRepository })
export class Discussion extends BaseEntity {
  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
  note: Ref<Note>

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany({ entity: () => Answer, mappedBy: 'discussion', cascade: [Cascade.REMOVE] })
  answers = new Collection<Answer>(this)

  @OneToMany({
    entity: () => DiscussionComment,
    mappedBy: (dc) => dc.commentable,
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<DiscussionComment>(this)

  @Property({ hidden: false })
  createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
  updatedAt = new Date()

  @OneToMany({
    entity: () => DiscussionFollow,
    mappedBy: (dc) => dc.followableId,
    cascade: [Cascade.REMOVE],
  })
  follows = new Collection<DiscussionFollow>(this)

  constructor(note: Note, user: User) {
    super()
    this.note = Reference.create(note)
    this.user = Reference.create(user)
  }

  async isAccessibleBy(user: User) {
    if (!user) {
      return false
    }

    const note = await this.note.load()

    if (this.user.id === user.id || note.isPublic()) {
      return true
    }

    if (note.isInSpace()) {
      const spaces = await user.accessibleSpaces()
      const scope = note.scope as SpaceScope
      return spaces.map((space) => space.scope).includes(scope)
    }
  }
}
