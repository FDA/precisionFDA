import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  Property,
  Reference
} from '@mikro-orm/core'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'

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
