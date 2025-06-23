import { Collection, Entity, Ref, ManyToOne, OneToMany, Property, Reference } from '@mikro-orm/core'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { LicenseRepository } from '@shared/domain/license/license.repository'

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

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
