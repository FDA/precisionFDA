import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { Note } from '../note'
import { Discussion } from '../discussion'
import { AnswerComment } from '../comment'

@Entity({ tableName: 'answers' })
export class Answer extends BaseEntity {
  @PrimaryKey()
    id: number

  @OneToOne({cascade: [Cascade.REMOVE]})
    note: Ref<Note>

  @ManyToOne()
    discussion: Ref<Discussion>

  @ManyToOne()
    user: Ref<User>

  @OneToMany({ entity: () => AnswerComment, mappedBy: ac => ac.commentableId,
    cascade: [Cascade.REMOVE]})
    comments = new Collection<AnswerComment>(this)

  @Property({ hidden: false })
    createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
    updatedAt = new Date()

  constructor(note: Note, discussion: Discussion, user: User) {
    super()
    this.note = Reference.create(note)
    this.discussion = Reference.create(discussion)
    this.user = Reference.create(user)
  }
}
