import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { WorkaroundJsonType } from '@shared/database/custom-json-type'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { SPACE_MEMBERSHIP_SIDE } from '../space-membership/space-membership.enum'
import { SPACE_STATE, SPACE_TYPE } from './space.enum'
import { getScopeFromSpaceId } from './space.helper'
import { SpaceRepository } from './space.repository'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'

type SpaceMeta = {
  cts: string,
  restricted_reviewer: boolean,
  restricted_discussions: boolean,
}

@Entity({ tableName: 'spaces', repository: () => SpaceRepository })
export class Space extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  description: string

  @Property({ fieldName: 'host_dxorg' })
  hostDxOrg: string

  @Property({ fieldName: 'guest_dxorg' })
  guestDxOrg: string

  // this should never be null i think??
  @Property({ fieldName: 'host_project', nullable: true })
  hostProject: string

  @Property({ fieldName: 'guest_project', nullable: true })
  guestProject: string

  @Enum(() => SPACE_STATE)
  state: SPACE_STATE

  @Enum({ items: () => SPACE_TYPE, fieldName: 'space_type' })
  type: SPACE_TYPE

  @Property({ fieldName: 'space_id', nullable: true })
  spaceId: number

  @Property()
  sponsorOrgId: number

  @Property({
    type: WorkaroundJsonType,
    columnType: 'text',
  })
  meta?: SpaceMeta

  @Property()
  restrictToTemplate?: boolean

  @Property()
  protected?: boolean

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @OneToOne(() => DataPortal, (dataPortal: DataPortal) => dataPortal.space)
  dataPortal?: DataPortal

  @Property({ persist: false })
  get uid(): string {
    return getScopeFromSpaceId(this.id)
  }

  @Property({ persist: false })
  get scope() {
    return `space-${this.id}` as const
  }

  isConfidential(): boolean {
    return this.spaceId !== null
  }

  isConfidentialReviewerSpace() {
    return this.isConfidentialNonPrivateSpace() && this.hostDxOrg !== null
  }

  isConfidentialSponsorSpace() {
    return this.isConfidentialNonPrivateSpace() && this.guestDxOrg !== null
  }

  private isConfidentialNonPrivateSpace() {
    return this.isConfidential() && this.type !== SPACE_TYPE.PRIVATE_TYPE
  }

  [EntityRepositoryType]?: SpaceRepository

  async findLeadBySide(side: SPACE_MEMBERSHIP_SIDE): Promise<User | undefined> {
    await this.spaceMemberships.init()
    const result = this.spaceMemberships.getItems().find((x) => {
      return x.isLead() && x.side === side
    })
    await result?.user.load()
    return result?.user.getEntity()
  }

  async findHostLead(): Promise<User | undefined> {
    return await this.findLeadBySide(SPACE_MEMBERSHIP_SIDE.HOST)
  }

  async findGuestLead(): Promise<User | undefined> {
    return await this.findLeadBySide(SPACE_MEMBERSHIP_SIDE.GUEST)
  }
}
