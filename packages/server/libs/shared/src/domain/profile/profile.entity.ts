import { Entity, ManyToOne, OneToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core'
import { Country } from '../country/country.entity'
import { User } from '../user/user.entity'
import { ProfileRepository } from './profile.repository'

@Entity({ tableName: 'profiles', repository: () => ProfileRepository })
export class Profile {
  @PrimaryKey()
  id: number

  @Property({ nullable: true })
  address1?: string | null

  @Property({ nullable: true })
  address2?: string | null

  @Property({ nullable: true })
  city?: string | null

  @Property({ nullable: true })
  email?: string | null

  @Property({ default: false })
  emailConfirmed: boolean = false

  @Property({ nullable: true })
  postalCode?: string | null

  @Property({ nullable: true })
  phone?: string | null

  @Property({ default: false })
  phoneConfirmed: boolean = false

  @Property({ nullable: true })
  usState?: string | null

  @OneToOne({ entity: () => User, fieldName: 'user_id' })
  user: Ref<User>

  @ManyToOne({ entity: () => Country, fieldName: 'country_id', nullable: true })
  country?: Ref<Country> | null

  @ManyToOne({ entity: () => Country, fieldName: 'phone_country_id', nullable: true })
  phoneCountry?: Ref<Country> | null

  constructor(user: User) {
    this.user = Reference.create(user)
  }
}
