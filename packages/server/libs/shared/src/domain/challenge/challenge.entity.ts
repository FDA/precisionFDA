import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property, Ref } from '@mikro-orm/core'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ChallengeResource } from './challenge-resource.entity'
import { CHALLENGE_STATUS } from './challenge.enum'
import { ChallengeRepository } from './challenge.repository'
import { ScopedEntity } from '@shared/database/scoped.entity'

@Entity({ tableName: 'challenges', repository: () => ChallengeRepository })
export class Challenge extends ScopedEntity {
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
  preRegistrationUrl: string

  // todo: this is a FK
  @Property()
  spaceId: number

  // todo: this is a FK
  @Property()
  appId: number

  @Property()
  infoContent: string

  @Property()
  infoEditorState: string

  @Property()
  resultsContent: string

  @Property()
  resultsEditorState: string

  @Property()
  preRegistrationContent: string

  @Property()
  preRegistrationEditorState: string

  @Property()
  specifiedOrder: number

  @ManyToOne(() => User)
  appOwner!: Ref<User>

  @OneToMany({ entity: () => ChallengeResource, mappedBy: 'challenge', orphanRemoval: true })
  challengeResources = new Collection<ChallengeResource>(this)
}
