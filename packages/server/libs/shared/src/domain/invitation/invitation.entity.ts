import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { User } from '@shared/domain/user/user.entity'
import { PROVISIONING_STATE } from './invitation.enum'

@Entity({ tableName: 'invitations', repository: () => InvitationRepository })
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

  @Property({ hidden: true }) // do not expose IP in API responses
  ip: string

  @Property({ type: 'json' })
  extras: {
    participate_intent: boolean
    req_software: string
    req_data: string
    research_intent: boolean
    clinical_intent: boolean
    req_reason: string
    organize_intent: boolean
  }

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
  organizationAdmin: boolean

  @Property()
  countryId: number

  @Property()
  phoneCountryId: number

  @Property()
  provisioningState: PROVISIONING_STATE

  @Property({ hidden: false })
  createdAt = new Date()

  @Property({ onUpdate: () => new Date(), hidden: false })
  updatedAt = new Date()
}
