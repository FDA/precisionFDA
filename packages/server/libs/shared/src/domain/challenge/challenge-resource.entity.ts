import { Entity, Ref, ManyToOne, Property, EntityRepositoryType, Reference } from '@mikro-orm/core'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { Challenge } from './challenge.entity'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'

@Entity({ tableName: 'challenge_resources', repository: () => ChallengeResourceRepository })
class ChallengeResource extends BaseEntity {
  @Property()
  url: string

  @Property({ type: WorkaroundJsonType, columnType: 'text' })
  meta: any

  @ManyToOne({ entity: () => Challenge })
  challenge: Ref<Challenge>

  @ManyToOne({ entity: () => UserFile })
  userFile: Ref<UserFile>

  @ManyToOne({ entity: () => User })
  user!: Ref<User>;

  [EntityRepositoryType]?: ChallengeResourceRepository

  constructor(userId: number, challengeId: number, userFileId: number) {
    super()
    this.user = Reference.createFromPK(User, userId)
    this.challenge = Reference.createFromPK(Challenge, challengeId)
    this.userFile = Reference.createFromPK(UserFile, userFileId)
  }

  @Property({ persist: false })
  get name(): string {
    return this.userFile?.getEntity().name
  }

  @Property({ persist: false })
  get description(): string | undefined {
    return this.userFile?.getEntity().description
  }

  @Property({ persist: false })
  get uid(): string {
    return `challenge-resource-${this.id.toString()}`
  }
}

export { ChallengeResource }
