import {
  Entity,
  IdentifiedReference,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { License } from '../license/license.entity'

@Entity({ tableName: 'accepted_licenses' })
export class AcceptedLicense extends BaseEntity {
  @PrimaryKey()
  id: number

  @OneToOne()
  license: IdentifiedReference<License>

  @OneToOne()
  user: IdentifiedReference<User>

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
