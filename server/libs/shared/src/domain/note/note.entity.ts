import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { SCOPE } from '../../types/common'

export type NoteType = 'Discussion' | 'Answer'

@Entity({ tableName: 'notes' })
export class Note extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  title: string

  @Property()
  content: string

  @Property()
  scope: SCOPE

  @Property()
  noteType: NoteType

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany(() => Attachment, attachment => attachment.note, { cascade: [Cascade.REMOVE] })
  attachments = new Collection<Attachment>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
