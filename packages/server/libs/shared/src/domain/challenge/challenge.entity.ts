import {
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
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { ChallengeResource } from './challenge-resource.entity'
import { CHALLENGE_STATUS } from './challenge.enum'
import { ChallengeRepository } from './challenge.repository'

@Entity({ tableName: 'challenges', repository: () => ChallengeRepository })
export class Challenge extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  description: string

  @Property()
  meta: string

  @OneToOne(() => UserFile)
  cardImage: Ref<UserFile>

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
  cardImageId: Uid<'file'>

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
  admin!: Ref<User>

  @ManyToOne(() => User)
  appOwner!: Ref<User>

  @OneToMany({ entity: () => ChallengeResource, mappedBy: 'challenge', orphanRemoval: true })
  challengeResources = new Collection<ChallengeResource>(this)

  constructor(admin: User, appOwner: User) {
    super()
    this.admin = Reference.create(admin)
    this.appOwner = Reference.create(appOwner)
  }
}
