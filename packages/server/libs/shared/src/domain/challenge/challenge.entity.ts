import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ChallengeResource } from './challenge-resource.entity'
import { CHALLENGE_STATUS } from './challenge.enum'
import { ChallengeRepository } from './challenge.repository'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { SpaceScope } from '@shared/types/common'

@Entity({ tableName: 'challenges', repository: () => ChallengeRepository })
export class Challenge extends ScopedEntity {
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

  constructor() {
    super()
  }

  async isAccessibleBy(user: User) {
    if (await user?.isSiteOrChallengeAdmin()) {
      return true
    }

    if (this.isPublic()) {
      return this.status !== CHALLENGE_STATUS.SETUP
    }

    if (this.isInSpace()) {
      const spaces = (await user?.accessibleSpaces()) ?? []
      return spaces.map((space) => space.scope).includes(this.scope as SpaceScope)
    }
  }

  async isEditableBy(user: User) {
    if (!user) {
      return false
    }
    return await user.isSiteOrChallengeAdmin()
  }
}
