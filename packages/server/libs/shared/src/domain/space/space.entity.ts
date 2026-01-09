import {
  Collection,
  Entity,
  Enum,
  Filter,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { DxId } from '../entity/domain/dxid'
import { SPACE_MEMBERSHIP_SIDE } from '../space-membership/space-membership.enum'
import { SPACE_STATE, SPACE_TYPE } from './space.enum'
import { SpaceRepository } from './space.repository'

type SpaceMeta = {
  cts: string
  restricted_reviewer: boolean
  restricted_discussions: boolean
}

@Filter({
  name: 'excludeDeleted',
  cond: () => ({ state: { $ne: SPACE_STATE.DELETED } }),
  default: true,
})
@Entity({ tableName: 'spaces', repository: () => SpaceRepository })
export class Space extends BaseEntity {
  @Property()
  name: string

  @Property()
  description: string

  @Property({ fieldName: 'host_dxorg' })
  hostDxOrg: DxId<'org'>

  @Property({ fieldName: 'guest_dxorg' })
  guestDxOrg: DxId<'org'>

  // this should never be null I think??
  @Property({ fieldName: 'host_project', nullable: true })
  hostProject: DxId<'project'>

  @Property({ fieldName: 'guest_project', nullable: true })
  guestProject: DxId<'project'>

  @Enum(() => SPACE_STATE)
  state: SPACE_STATE

  @Enum({ items: () => SPACE_TYPE, fieldName: 'space_type' })
  type: SPACE_TYPE

  @Property({ fieldName: 'space_id', nullable: true })
  spaceId: number

  @ManyToOne(() => Space, { nullable: true })
  space?: Space

  @OneToMany(() => Space, (space) => space.space)
  confidentialSpaces = new Collection<Space>(this)

  @Property()
  sponsorOrgId: number

  @Property({ type: WorkaroundJsonType })
  meta?: SpaceMeta

  @Property()
  protected?: boolean

  @Property()
  hidden: boolean

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @ManyToMany(() => SpaceGroup, (spaceGroup) => spaceGroup.spaces)
  spaceGroups = new Collection<SpaceGroup>(this)

  @OneToMany(() => Tagging, (tagging) => tagging.space, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @OneToOne(() => DataPortal, (dataPortal: DataPortal) => dataPortal.space)
  dataPortal?: DataPortal

  @Property({ persist: false })
  get scope(): `space-${number}` {
    return `space-${this.id}`
  }

  /**
   * Returns the space that is the confidential reviewer space for this space.
   */
  get confidentialReviewerSpace(): Space | undefined {
    return this.confidentialSpaces.getItems().find((x) => x.isConfidentialReviewerSpace())
  }

  /**
   * Returns the space that is the confidential sponsor space for this space.
   */
  get confidentialSponsorSpace(): Space | undefined {
    return this.confidentialSpaces.getItems().find((x) => x.isConfidentialSponsorSpace())
  }

  isConfidential(): boolean {
    return this.spaceId !== null
  }

  isConfidentialReviewerSpace(): boolean {
    return this.isConfidentialNonPrivateSpace() && this.hostDxOrg !== null
  }

  isConfidentialSponsorSpace(): boolean {
    return this.isConfidentialNonPrivateSpace() && this.guestDxOrg !== null
  }

  getMembershipOrg(membership: SpaceMembership): DxId<'org'>[] {
    if (this.type === SPACE_TYPE.GROUPS) {
      return [this.hostDxOrg, this.guestDxOrg]
    } else {
      const org = membership.isHost() ? this.hostDxOrg : this.guestDxOrg
      return [org]
    }
  }

  private isConfidentialNonPrivateSpace(): boolean {
    return this.isConfidential() && this.type !== SPACE_TYPE.PRIVATE_TYPE
  }

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
