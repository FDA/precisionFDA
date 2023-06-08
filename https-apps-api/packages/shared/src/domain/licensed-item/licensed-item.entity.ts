import { Entity, EntityRepositoryType, IdentifiedReference, ManyToOne, PrimaryKey, Property, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { License } from '../license/license.entity'
import { LicensedItemRepository } from './licensed-item.repository'

@Entity({ tableName: 'licensed_items', customRepository: () => LicensedItemRepository})
export class LicensedItem extends BaseEntity {
  @PrimaryKey()
  id: number

  @ManyToOne(() => License)
  license: IdentifiedReference<License>

  @Property()
  licenseableId: number // Node

  @Property()
  licenseableType: string

  [EntityRepositoryType]?: LicensedItemRepository

  constructor(license: License, licenseableId: number) {
    super()
    this.license = Reference.create(license)
    this.licenseableId = licenseableId
  }
}
