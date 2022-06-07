import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '..'
import { BaseEntity } from '../../database/base-entity'
import { CHALLENGE_STATUS } from './challenge.enum'

@Entity({ tableName: 'challenges' })
export class Challenge extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  description: string

  @Property()
  meta: string

  @Property()
  startAt: Date

  @Property()
  endAt: Date

  @Property()
  status: CHALLENGE_STATUS

  @Property()
  automated: boolean

  @Property()
  cardImageUrl: string

  @Property()
  cardImageId: string

  @Property()
  scope: string

  @Property()
  preRegistrationUrl: string

  // todo: this is a FK
  @Property()
  spaceId: number

  // todo: this is a FK
  @Property()
  appId: number

  @ManyToOne(() => User)
  admin!: IdentifiedReference<User>

  @ManyToOne(() => User)
  appOwner!: IdentifiedReference<User>

  constructor(admin: User, appOwner: User) {
    super()
    this.admin = Reference.create(admin)
    this.appOwner = Reference.create(appOwner)
  }
}
