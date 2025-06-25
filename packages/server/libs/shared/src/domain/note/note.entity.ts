import {
  Cascade,
  Collection,
  Entity,
  Filter,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { NoteRepository } from '@shared/domain/note/note.repository'

export type NoteType = 'Discussion' | 'Answer'

@Entity({ tableName: 'notes', repository: () => NoteRepository })
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [
      { user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE },
      { scope: { $in: args.spaceScopes } },
    ],
  }),
})
export class Note extends ScopedEntity {
  @Property()
  title: string

  @Property()
  content: string

  @Property()
  noteType: NoteType

  @ManyToOne(() => User)
  user: Ref<User>

  @OneToMany(() => Attachment, (attachment) => attachment.note, { cascade: [Cascade.REMOVE] })
  attachments = new Collection<Attachment>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  isPublishable(): boolean {
    return this.isPrivate()
  }
}
