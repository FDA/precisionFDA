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
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'discussions' })
export class Discussion extends BaseEntity {
  @OneToOne({ entity: () => Note, cascade: [Cascade.REMOVE] })
  note: Ref<Note>

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany({ entity: () => Answer, mappedBy: 'discussion', cascade: [Cascade.REMOVE] })
  answers = new Collection<Answer>(this)

  @OneToMany({
    entity: () => DiscussionComment,
    mappedBy: dc => dc.commentableId,
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<DiscussionComment>(this)

  @Property({ hidden: false })
  createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
  updatedAt = new Date()

  constructor(note: Note, user: User) {
    super()
    this.note = Reference.create(note)
    this.user = Reference.create(user)
  }
}
