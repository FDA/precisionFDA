import { Entity, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { CommentRepository } from '@shared/domain/comment/comment.repository'

export type CommentableType = 'Discussion' | 'Answer' | 'Space' | 'Note' | 'ExpertQuestion'
@Entity({
  abstract: true,
  tableName: 'comments',
  discriminatorColumn: 'commentableType',
  repository: () => CommentRepository,
})
export class Comment extends BaseEntity {
  @Property({ fieldName: 'commentable_type' })
  commentableType: CommentableType

  @Property()
  body: string

  @Property()
  contentObjectId: number

  @Property()
  contentObjectType: string

  @Property()
  title: string

  @Property()
  parentId: number

  @Property()
  state: number

  @Property()
  subject: string

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: Ref<User>

  @Property({ hidden: false })
  createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
  updatedAt = new Date()

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
