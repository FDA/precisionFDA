import { Entity, Ref, ManyToOne, Property, EntityRepositoryType } from '@mikro-orm/core'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { Challenge } from './challenge.entity'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'

@Entity({ tableName: 'challenge_resources', repository: () => ChallengeResourceRepository })
class ChallengeResource extends BaseEntity {
  @Property({ fieldName: 'challenge_id' })
  challengeId: number

  @Property({ fieldName: 'user_file_id' })
  userFileId: number

  @Property({ fieldName: 'user_id' })
  userId: number

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
