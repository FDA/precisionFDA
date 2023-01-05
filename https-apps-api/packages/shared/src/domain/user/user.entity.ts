import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { config } from '../../config'
import { SpaceMembership } from '..'
import { BaseEntity } from '../../database/base-entity'
import { EmailNotification } from '../email'
import { Job } from '../job/job.entity'
import { Organization } from '../org'
import { ExpertQuestion } from '../expert-question/expert-question.entity'
import { Expert } from '../expert/expert.entity'
import { AdminMembership } from '../admin-membership/admin-membership.entity'
import { ADMIN_GROUP_ROLES } from '../admin-group'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { UserRepository } from './user.repository'


export enum USER_STATE {
  ENABLED = 0,
  LOCKED = 1,
  DEACTIVATED = 2
}

export const RESOURCE_TYPES = [
  // Compute instancess
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

type CloudResourceSettings = {
  job_limit: number
  total_limit: number
  resources: Array<(typeof RESOURCE_TYPES)[number]>
}


// contains the bare minimum to work with the user instance
// might need to add more fields in the time
@Entity({ tableName: 'users', customRepository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxuser: string

  @Property({ nullable: true })
  privateFilesProject?: string

  @Property()
  publicFilesProject: string

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

  @Enum({ type: () => USER_STATE,
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
    } })
  userState: USER_STATE

  @Property({
    type: WorkaroundJsonType,
    columnType: 'text',
    })
  cloudResourceSettings?: CloudResourceSettings

  @OneToMany({ entity: () => Job, mappedBy: 'user' })
  jobs = new Collection<Job>(this)

  @OneToMany({ entity: () => SpaceMembership, mappedBy: 'user' })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @ManyToOne({ fieldName: 'org_id', entity: () => Organization })
  organization!: IdentifiedReference<Organization>

  @OneToOne({
    entity: () => EmailNotification,
    mappedBy: 'user',
    nullable: true,
    })
  emailNotificationSettings: IdentifiedReference<EmailNotification>;

  [EntityRepositoryType]?: UserRepository

  @OneToOne({
    entity: () => Expert,
    mappedBy: 'user',
    orphanRemoval: true,
    })
  expert: IdentifiedReference<Expert>

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


  constructor(org: Organization, emailNotificationSettings?: EmailNotification, expert?: Expert) {
    super()
    this.organization = Reference.create(org)
    if (emailNotificationSettings) {
      this.emailNotificationSettings = Reference.create(emailNotificationSettings)
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
  get spaceUids(): string[] {
    const spaceUids: string[] = []
    Array.from(this.spaceMemberships).forEach(spaceMembership => {
      Array.from(spaceMembership.spaces).forEach(space => spaceUids.push(`space-${space.id}`))
    })
    return spaceUids
  }

  isMemberOfSpace(spaceUid: string): boolean {
    return Object.values(this.spaceUids).includes(spaceUid)
  }

  isChallengeBot(): boolean {
    return this.dxuser === config.platform.challengeBotUser
  }

  static getChallengeBotToken(): string {
    return config.platform.challengeBotAccessToken
  }

  isGuest(): boolean {
    return this.dxuser.startsWith('Guest-')
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
}
