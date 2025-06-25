import { Collection, Entity, ManyToOne, OneToMany, Property, Ref } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'

import { BaseEntity } from '../../database/base.entity'
import { OrgRepository } from './org.repository'

@Entity({ tableName: 'orgs', repository: () => OrgRepository })
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

  static createDxOrg(handle: string): string {
    return `org-pfda..${handle}`
  }

  getDxOrg(): string {
    return Organization.createDxOrg(this.handle)
  }

  isLegacy(): boolean {
    return this.users.length > 1
  }
}
