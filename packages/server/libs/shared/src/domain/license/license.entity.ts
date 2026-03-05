import { Collection, Entity, ManyToOne, OneToMany, Property, Ref, Reference } from '@mikro-orm/core'
import { LicenseRepository } from '@shared/domain/license/license.repository'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { AcceptedLicense } from '../accepted-license/accepted-license.entity'

@Entity({ tableName: 'licenses', repository: () => LicenseRepository })
export class License extends BaseEntity {
  @ManyToOne(() => User)
  user: Ref<User>

  @Property()
  content: string

  @Property()
  title: string

  @Property()
  scope: string

  @Property({ serializedName: 'approval_required' })
  approvalRequired: boolean

  @OneToMany({
    entity: () => LicensedItem,
    mappedBy: 'license',
  })
  licensedItems = new Collection<LicensedItem>(this)

  @OneToMany({
    entity: () => AcceptedLicense,
    mappedBy: 'license',
  })
  acceptedLicenses = new Collection<AcceptedLicense>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
