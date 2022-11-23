import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  Property,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { UserFile } from '../user-file'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { Challenge } from './challenge.entity'


@Entity({ tableName: 'challenge_resources' })
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
  challenge: IdentifiedReference<Challenge>

  @ManyToOne({ entity: () => UserFile })
  userFile: IdentifiedReference<UserFile>

  @ManyToOne({ entity: () => User })
  user!: IdentifiedReference<User>

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

export {
  ChallengeResource,
}
