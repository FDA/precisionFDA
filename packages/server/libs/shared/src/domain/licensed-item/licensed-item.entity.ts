import {
  Entity,
  EntityRepositoryType,
  Ref,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { License } from '@shared/domain/license/license.entity'
import { BaseEntity } from '../../database/base-entity'
import { LicensedItemRepository } from './licensed-item.repository'

@Entity({ tableName: 'licensed_items', repository: () => LicensedItemRepository })
export class LicensedItem extends BaseEntity {
  @PrimaryKey()
  id: number

  @ManyToOne(() => License)
  license: Ref<License>

  @Property()
  licenseableId: number // Node

  @Property()
  licenseableType: string;

  [EntityRepositoryType]?: LicensedItemRepository

  constructor(license: License, licenseableId: number) {
    super()
    this.license = Reference.create(license)
    this.licenseableId = licenseableId
  }
}
