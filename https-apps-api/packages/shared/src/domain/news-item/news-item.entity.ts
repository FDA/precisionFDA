import { Entity, EntityRepositoryType, IdentifiedReference, ManyToOne, OneToOne, Property, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { NewsRepository } from './news-item.repository'

@Entity({ tableName: 'news_items', customRepository: () => NewsRepository })
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
  user!: IdentifiedReference<User>

  @Property({ persist: false })
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
