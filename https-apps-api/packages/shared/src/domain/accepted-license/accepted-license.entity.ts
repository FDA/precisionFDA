import {
  Entity,
  Ref,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { License } from '../license'

@Entity({ tableName: 'accepted_licenses' })
export class AcceptedLicense extends BaseEntity {
  @PrimaryKey()
  id: number

  @OneToOne()
  license: Ref<License>

  @OneToOne()
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
