import {
  Collection,
  Entity,
  ManyToOne, OneToMany,
  PrimaryKey,
  Property,
  Ref,
  Reference
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { Attachment } from '../attachment'

@Entity({tableName: 'notes'})
export class Note extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  title: string

  @Property()
  content: string

  @Property()
  scope: string

  @Property()
  noteType: string

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany(() => Attachment, attachment => attachment.note)
  attachments = new Collection<Attachment>(this)

  constructor(user: User) {
    super();
    this.user = Reference.create(user)
  }
}
