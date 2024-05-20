import { Entity, EntityRepositoryType, Ref, ManyToOne, Property, Reference } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { NewsRepository } from './news-item.repository'

@Entity({ tableName: 'news_items', repository: () => NewsRepository })
class NewsItem extends BaseEntity {
  @Property()
  title?: string

  @Property()
  link?: string

  @Property({ hidden: false })
  createdAt = new Date()

  @Property({ type: 'text' })
  content?: string

  @Property()
  video?: string

  @Property({ type: 'int', nullable: true })
  position?: number

  @Property({ type: 'boolean' })
  published?: boolean

  @Property({ type: 'boolean', default: false })
  isPublication?: boolean

  @Property()
  userId: number

  @ManyToOne(() => User)
  user!: Ref<User>

  get year() {
    return this.createdAt.getFullYear()
  }

  [EntityRepositoryType]?: NewsRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}

export { NewsItem }
