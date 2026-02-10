import { Collection, Entity, ManyToOne, OneToMany, Property, Ref } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'

import { BaseEntity } from '../../database/base.entity'
import { DxId } from '../entity/domain/dxid'
import { OrganizationRepository } from './organization.repository'

@Entity({ tableName: 'orgs', repository: () => OrganizationRepository })
export class Organization extends BaseEntity {
  // N.B handle is not the dxid of the org on platform
  //     See createDxOrg() below for the format of org dxid on platform
  @Property()
  handle: string

  @Property()
  name: string

  @ManyToOne({ entity: () => User })
  admin?: Ref<User>

  @Property()
  address?: string

  @Property()
  duns?: string

  @Property()
  phone?: string

  @Property()
  state: string

  @Property()
  singular: boolean

  @OneToMany({ entity: () => User, mappedBy: 'organization' })
  users = new Collection<User>(this)

  static createDxOrg(handle: string): DxId<'org'> {
    return `org-pfda..${handle}`
  }

  getDxOrg(): DxId<'org'> {
    return Organization.createDxOrg(this.handle)
  }

  isLegacy(): boolean {
    return this.users.length > 1
  }
}
