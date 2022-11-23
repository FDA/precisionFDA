import {
  Collection,
  Entity,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User, UserFile } from '..'
import { BaseEntity } from '../../database/base-entity'
import { ChallengeResource } from './challenge-resource.entity'
import { CHALLENGE_STATUS } from './challenge.enum'
import { ChallengeRepository } from './challenge.repository'

@Entity({ tableName: 'challenges', customRepository: () => ChallengeRepository })
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

  // Note: the value stored in cardImageId is actually the file's uid
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

  @OneToMany(({ entity: () => ChallengeResource, mappedBy: 'challenge', orphanRemoval: true }))
  challengeResources = new Collection<ChallengeResource>(this)

  constructor(admin: User, appOwner: User) {
    super()
    this.admin = Reference.create(admin)
    this.appOwner = Reference.create(appOwner)
  }
}
