import {
  Entity,
  Ref,
  ManyToOne,
  Reference,
  OneToOne,
  OneToMany,
  Collection,
  Property, Cascade, Formula,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { Note } from '../note'
import { Answer } from '../answer'
import { DiscussionComment } from '../comment'

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
