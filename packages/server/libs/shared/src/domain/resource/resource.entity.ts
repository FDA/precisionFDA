import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToOne,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'

@Entity({ tableName: 'resources', customRepository: () => ResourceRepository })
class Resource extends BaseEntity {
  @Property()
  url: string

  @Property()
  meta: string

  @ManyToOne(() => User)
  user!: Ref<User>

  @OneToOne(() => UserFile)
  userFile!: Ref<UserFile>

  @ManyToOne(() => DataPortal, { joinColumn: 'parent_id' })
  dataPortal: DataPortal

  @Property({ persist: false })
  get name(): string {
    return `${this.userFile.getProperty('name')}`
  }

  [EntityRepositoryType]?: ResourceRepository

  constructor(user: User, userFile: UserFile) {
    super()
    this.user = Reference.create(user)
    this.userFile = Reference.create(userFile)
  }
}

export { Resource }
