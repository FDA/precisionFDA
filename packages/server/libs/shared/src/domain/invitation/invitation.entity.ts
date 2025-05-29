import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { User } from '@shared/domain/user/user.entity'
import { PROVISIONING_STATE } from './invitation.enum'
import { InvitationRepository } from './invitation.repository'

export interface Extras {
  req_reason: string
  req_data: string
  req_software: string
  research_intent: boolean
  clinical_intent: boolean
  consistency_challenge_intent: string
  truth_challenge_intent: string
  participate_intent: boolean
  organize_intent: boolean
}

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

  @Property()
  ip: string

  @Property({ type: 'json' })
  extras: Extras

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
