import { Entity, OneToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { User } from '../user/user.entity'
import { ProfileRepository } from './profile.repository'

@Entity({ tableName: 'profiles', repository: () => ProfileRepository })
export class Profile {
  @PrimaryKey()
  id: number

  @Property()
  address1: string

  @Property()
  address2: string

  @Property()
  city: string

  @Property()
  email: string

  @Property()
  emailConfirmed: boolean

  @Property()
  postalCode: string

  @Property()
  phone: string

  @Property()
  phoneConfirmed: boolean

  @Property()
  usState: string

  @OneToOne({ entity: () => User })
  user: Ref<User>

  // FKs to country table, but unused currently
  @Property()
  countryId: number

  @Property()
  phoneCountryId: number
}
