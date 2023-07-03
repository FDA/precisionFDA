import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  Property,
  Reference
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { UserFile } from '../user-file'
import { DataPortal } from '../data-portal'

@Entity({ tableName: 'resources' })
class Resource extends BaseEntity {

  @Property()
  url: string

  @Property()
  meta: string

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  @ManyToOne(() => UserFile)
  userFile!: IdentifiedReference<UserFile>

  @ManyToOne(() => DataPortal, { joinColumn: 'parent_id' })
  dataPortal: DataPortal

  constructor(user: User, userFile: UserFile) {
    super()
    this.user = Reference.create(user)
    this.userFile = Reference.create(userFile)
  }

}

export { Resource }
