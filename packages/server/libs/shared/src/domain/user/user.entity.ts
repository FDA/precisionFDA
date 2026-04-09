import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Job } from '@shared/domain/job/job.entity'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Organization } from '@shared/domain/org/organization.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { ADMIN_LEAD_ROLES, CAN_EDIT_ROLES } from '@shared/domain/space-membership/space-membership.helper'
import { UserExtras } from '@shared/domain/user/user-extras'
import { config } from '../../config'
import { BaseEntity } from '../../database/base.entity'
import { AdminMembership } from '../admin-membership/admin-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { HeaderItem } from './header-item'
import { UserRepository } from './user.repository'

export enum USER_STATE {
  ENABLED = 0,
  LOCKED = 1,
  DEACTIVATED = 2,
}

export const CURRENT_SCHEMA_VERSION = 1

export const RESOURCE_TYPES = [
  // Compute instances
  'baseline-2',
  'baseline-4',
  'baseline-8',
  'baseline-16',
  'baseline-36',
  'hidisk-2',
  'hidisk-4',
  'hidisk-8',
  'hidisk-16',
  'hidisk-36',
  'himem-2',
  'himem-4',
  'himem-8',
  'himem-16',
  'himem-32',
  'gpu-8',
  // Db instances
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
] as const

export type Resource = (typeof RESOURCE_TYPES)[number]

export const PRICING_MAP = {
  // Compute instances
  'baseline-2': 0.286,
  'baseline-4': 0.572,
  'baseline-8': 1.144,
  'baseline-16': 2.288,
  'baseline-36': 5.148,
  'hidisk-2': 0.372,
  'hidisk-4': 0.744,
  'hidisk-8': 1.488,
  'hidisk-16': 2.976,
  'hidisk-36': 6.696,
  'himem-2': 0.474,
  'himem-4': 0.948,
  'himem-8': 1.896,
  'himem-16': 3.792,
  'himem-32': 7.584,
  'gpu-8': 10.787,
  // Db instances
  db_std1_x2: 0.273,
  db_mem1_x2: 0.967,
  db_mem1_x4: 1.933,
  db_mem1_x8: 3.867,
  db_mem1_x16: 7.733,
  db_mem1_x32: 15.467,
  db_mem1_x48: 23.2,
  db_mem1_x64: 30.933,
}

export const JOB_LIMIT = 100
export const TOTAL_LIMIT = 200
export const RESOURCES = ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'] as Array<
  (typeof RESOURCE_TYPES)[number]
>

export type CloudResourceSettings = {
  pricing_map: Record<(typeof RESOURCE_TYPES)[number], number>
  job_limit: number
  total_limit: number
  resources: Array<(typeof RESOURCE_TYPES)[number]>
  charges_baseline: {
    computeCharges: number
    storageCharges: number
    dataEgressCharges: number
  }
}

export const DEFAULT_HEADER_ITEMS = [
  { name: 'overview', favorite: false },
  { name: 'discussions', favorite: false },
  { name: 'challenges', favorite: false },
  { name: 'experts', favorite: false },
  { name: 'home', favorite: true },
  { name: 'spaces', favorite: true },
  { name: 'notes', favorite: false },
  { name: 'comparisons', favorite: false },
  { name: 'docs', favorite: true },
  { name: 'support', favorite: false },
  { name: 'daaas', favorite: false },
  { name: 'prism', favorite: false },
  { name: 'tools', favorite: false },
  { name: 'gsrs', favorite: false },
] as HeaderItem[]

export const DEFAULT_CLOUD_RESOURCE_SETTINGS: CloudResourceSettings = {
  pricing_map: PRICING_MAP,
  job_limit: JOB_LIMIT,
  total_limit: TOTAL_LIMIT,
  resources: RESOURCES,
  charges_baseline: {
    computeCharges: 0,
    storageCharges: 0,
    dataEgressCharges: 0,
  },
}

export const DEFAULT_USER_EXTRAS: UserExtras = {
  header_items: DEFAULT_HEADER_ITEMS,
  inactivity_email_sent: true,
  has_seen_guidelines: true,
}

@Entity({ tableName: 'users', repository: () => UserRepository })
export class User extends BaseEntity {
  @Property()
  dxuser: string

  @Property({ nullable: true })
  privateFilesProject?: DxId<'project'>

  @Property({ nullable: true })
  publicFilesProject: DxId<'project'>

  @Property({ nullable: true })
  privateComparisonsProject?: DxId<'project'>

  @Property({ nullable: true })
  publicComparisonsProject: DxId<'project'>

  @Property({ nullable: true })
  schemaVersion?: number

  @Property()
  firstName: string

  @Property()
  lastName: string

  @Property()
  email: string

  @Property()
  normalizedEmail: string

  // TODO(samuel) Ruby has a custom validation message on this constraint
  @Property({ length: 250, nullable: true })
  disableMessage?: string | null

  @Property({ nullable: true })
  lastLogin?: Date

  @Property({ nullable: true })
  lastDataCheckup?: Date

  @Enum({
    type: () => USER_STATE,
    serializer: (value: USER_STATE) => {
      switch (value) {
        case USER_STATE.ENABLED:
          return 'active'
        case USER_STATE.DEACTIVATED:
          return 'deactivated'
        case USER_STATE.LOCKED:
          return 'locked'
        default:
          return 'n/a'
      }
    },
  })
  userState: USER_STATE

  @Property({ type: WorkaroundJsonType })
  cloudResourceSettings?: CloudResourceSettings

  @Property({ type: WorkaroundJsonType })
  extras?: UserExtras

  @OneToMany({ entity: () => Job, mappedBy: 'user' })
  jobs = new Collection<Job>(this)

  @OneToMany({ entity: () => SpaceMembership, mappedBy: 'user' })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @ManyToOne({ fieldName: 'org_id', entity: () => Organization })
  organization!: Ref<Organization>

  @OneToOne({
    entity: () => NotificationPreference,
    mappedBy: 'user',
    nullable: true,
  })
  notificationPreference: Ref<NotificationPreference>

  @OneToOne({
    entity: () => Expert,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  expert: Ref<Expert>

  @OneToMany({
    entity: () => ExpertQuestion,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  expertQuestions = new Collection<ExpertQuestion>(this)

  @OneToMany({
    entity: () => AdminMembership,
    mappedBy: 'user',
  })
  adminMemberships = new Collection<AdminMembership>(this)

  @OneToMany({
    entity: () => NewsItem,
    mappedBy: 'user',
  })
  newsItems = new Collection<NewsItem>(this)

  constructor(org: Organization, notificationPreference?: NotificationPreference, expert?: Expert) {
    super()
    this.organization = Reference.create(org)
    if (notificationPreference) {
      this.notificationPreference = Reference.create(notificationPreference)
    }
    if (expert) {
      this.expert = Reference.create(expert)
    }
  }

  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  @Property({ persist: false })
  get dxid(): DxId<'user'> {
    return `user-${this.dxuser}`
  }

  username(): string {
    return this.dxuser
  }

  async accessibleSpaces(): Promise<Space[]> {
    await this.spaceMemberships.load({
      populate: ['spaces'],
      where: {
        active: true,
        spaces: {
          state: { $ne: SPACE_STATE.DELETED },
        },
      },
    })

    return Array.from(this.spaceMemberships).flatMap(spaceMembership => Array.from(spaceMembership.spaces))
  }

  async accessibleSpaceIds(): Promise<number[]> {
    const accessibleSpaces = await this.accessibleSpaces()
    return accessibleSpaces.map(space => space.id)
  }

  async editableSpaces(): Promise<Space[]> {
    await this.spaceMemberships.load({
      populate: ['spaces'],
      where: {
        active: true,
        role: { $in: CAN_EDIT_ROLES },
        spaces: {
          state: { $ne: SPACE_STATE.DELETED },
        },
      },
    })

    return Array.from(this.spaceMemberships).flatMap(membership => Array.from(membership.spaces))
  }

  /**
   * Returns spaces that the user is either lead or admin.
   */
  async manageableSpaces(): Promise<Space[]> {
    await this.spaceMemberships.load({
      populate: ['spaces'],
      where: {
        active: true,
        role: { $in: ADMIN_LEAD_ROLES },
        spaces: {
          state: { $ne: SPACE_STATE.DELETED },
        },
      },
    })

    return Array.from(this.spaceMemberships).flatMap(membership => Array.from(membership.spaces))
  }

  async leadableSpaces(): Promise<Space[]> {
    await this.spaceMemberships.load({
      populate: ['spaces'],
      where: {
        active: true,
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        spaces: {
          state: { $ne: SPACE_STATE.DELETED },
        },
      },
    })
    return Array.from(this.spaceMemberships).flatMap(membership => Array.from(membership.spaces))
  }

  isChallengeBot(): boolean {
    return this.dxuser === config.platform.challengeBotUser
  }

  isGovUser(): boolean {
    const emailDomain = this.email.split('@').pop()
    return ['fda.hhs.gov', 'fda.gov'].includes(emailDomain)
  }

  async isMemberOfAdminGroup(adminGroup: ADMIN_GROUP_ROLES): Promise<boolean> {
    const siteAdminGroupMemberships = await this.adminMemberships.matching({
      where: {
        adminGroup: {
          role: adminGroup,
        },
      },
      populate: ['adminGroup'],
    })

    return siteAdminGroupMemberships.length > 0
  }

  async isSiteAdmin(): Promise<boolean> {
    return await this.isMemberOfAdminGroup(ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
  }

  async isReviewSpaceAdmin(): Promise<boolean> {
    return await this.isMemberOfAdminGroup(ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN)
  }

  async isChallengeAdmin(): Promise<boolean> {
    return await this.isMemberOfAdminGroup(ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN)
  }

  async isSiteOrChallengeAdmin(): Promise<boolean> {
    return (await this.isSiteAdmin()) || (await this.isChallengeAdmin())
  }

  billTo(): DxId<'org'> {
    return this.organization.getEntity().getDxOrg()
  }
}
