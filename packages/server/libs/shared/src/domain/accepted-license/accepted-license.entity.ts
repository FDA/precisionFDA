import {
  Entity,
  Ref,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'accepted_licenses' })
export class AcceptedLicense extends BaseEntity {
  @PrimaryKey()
  id: number

  @OneToOne({
    entity: () => License,
  })
  license: Ref<License>

  @OneToOne({
    entity: () => User,
  })
  user: Ref<User>

  @Property()
  state: string

  @Property()
  message: string

  constructor(license: License, user: User) {
    super()
    this.license = Reference.create(license)
    this.user = Reference.create(user)
  }
}
