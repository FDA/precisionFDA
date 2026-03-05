import { Entity, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'

@Entity({ tableName: 'accepted_licenses', repository: () => AcceptedLicenseRepository })
export class AcceptedLicense extends BaseEntity {
  @ManyToOne({
    entity: () => License,
  })
  license: Ref<License>

  @ManyToOne({
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
