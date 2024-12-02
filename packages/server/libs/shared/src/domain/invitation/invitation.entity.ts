import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '@shared/database/base.entity'

@Entity({ tableName: 'invitations' })
export class Invitation extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  firstName: string

  @Property()
  lastName: string

  @Property()
  email: string

  @Property()
  org: string

  @Property()
  singular: boolean

  @Property()
  phone: string

  @Property()
  duns: string

  @Property()
  ip: string

  @Property()
  extras: string

  @ManyToOne(() => User)
  user: Ref<User>

  @Property()
  state: string

  @Property()
  code: string

  @Property()
  city: string

  @Property()
  usState: string

  @Property()
  postalCode: string

  @Property()
  address1: string

  @Property()
  address2: string

  @Property()
  organizationalAdmin: boolean

  @Property()
  countryId: number

  @Property()
  phoneCountryId: number
}
