import { Entity, Ref, OneToOne, Property, Reference } from '@mikro-orm/core'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'

@Entity({ tableName: 'accepted_licenses', repository: () => AcceptedLicenseRepository })
export class AcceptedLicense extends BaseEntity {
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
