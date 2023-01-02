import { Collection, Entity, IdentifiedReference, ManyToOne, OneToMany, PrimaryKey, Property, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { LicensedItem } from '../licensed-item/licensed-item.entity'

@Entity({ tableName: 'licenses' })
export class License extends BaseEntity {
  @PrimaryKey()
  id: number

  @ManyToOne(() => User)
  user: IdentifiedReference<User>;

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
