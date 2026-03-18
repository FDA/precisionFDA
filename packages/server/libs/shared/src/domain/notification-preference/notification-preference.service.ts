import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { DEFAULT_NOTIFICATION_PREFERENCES } from './notification-preference.config'
import { NotificationPreference } from './notification-preference.entity'
import { NotificationPreferenceRepository } from './notification-preference.repository'

/**
 * Preference keys grouped by role/scope.
 * These groups are used to structure the response for the client UI.
 */
const GROUP_CONTRIBUTOR_KEYS = [
  'group_contributor_membership_changed',
  'group_contributor_comment_activity',
  'group_contributor_content_added_or_deleted',
] as const

const SHARED_CONTRIBUTOR_KEYS = [
  'shared_contributor_membership_changed',
  'shared_contributor_comment_activity',
  'shared_contributor_content_added_or_deleted',
] as const

const GROUP_VIEWER_KEYS = [
  'group_viewer_membership_changed',
  'group_viewer_comment_activity',
  'group_viewer_content_added_or_deleted',
] as const

const SHARED_VIEWER_KEYS = [
  'shared_viewer_membership_changed',
  'shared_viewer_comment_activity',
  'shared_viewer_content_added_or_deleted',
] as const

const GROUP_LEAD_KEYS = [
  'group_lead_membership_changed',
  'group_lead_comment_activity',
  'group_lead_content_added_or_deleted',
  'group_lead_member_added_to_space',
  'group_lead_space_locked_unlocked_deleted',
] as const

const SHARED_LEAD_KEYS = [
  'shared_lead_membership_changed',
  'shared_lead_comment_activity',
  'shared_lead_content_added_or_deleted',
  'shared_lead_member_added_to_space',
  'shared_lead_space_locked_unlocked_deleted',
] as const

const ADMIN_KEYS = [
  'admin_membership_changed',
  'admin_comment_activity',
  'admin_content_added_or_deleted',
  'admin_member_added_to_space',
  'admin_space_locked_unlocked_deleted',
] as const

const PRIVATE_SCOPE_KEYS = [
  'private_job_finished',
  'private_challenge_opened',
  'private_challenge_preregister',
  'private_job_stale',
] as const

export const ALL_PREFERENCE_KEYS = [
  ...GROUP_CONTRIBUTOR_KEYS,
  ...SHARED_CONTRIBUTOR_KEYS,
  ...GROUP_VIEWER_KEYS,
  ...SHARED_VIEWER_KEYS,
  ...GROUP_LEAD_KEYS,
  ...SHARED_LEAD_KEYS,
  ...ADMIN_KEYS,
  ...PRIVATE_SCOPE_KEYS,
] as const

export type PreferenceKey = (typeof ALL_PREFERENCE_KEYS)[number]

export interface GroupedPreferences {
  group_contributor: Record<string, boolean>
  shared_contributor: Record<string, boolean>
  group_viewer: Record<string, boolean>
  shared_viewer: Record<string, boolean>
  group_lead: Record<string, boolean>
  shared_lead: Record<string, boolean>
  admin: Record<string, boolean>
  private: Record<string, boolean>
}

@Injectable()
export class NotificationPreferenceService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly repo: NotificationPreferenceRepository,
  ) {}

  // Get all preferences grouped by role/scope (read-only).
  async getGroupedPreferences(): Promise<GroupedPreferences> {
    const pref = await this.repo.findOne({ user: this.user.id })
    const data = pref?.data ?? DEFAULT_NOTIFICATION_PREFERENCES

    const buildGroup = (keys: readonly PreferenceKey[]): Record<string, boolean> => {
      const group: Record<string, boolean> = {}
      for (const key of keys) {
        const value = data[key]
        const defaultValue = DEFAULT_NOTIFICATION_PREFERENCES[key]
        group[key] = value ?? defaultValue
      }
      return group
    }

    return {
      group_contributor: buildGroup(GROUP_CONTRIBUTOR_KEYS),
      shared_contributor: buildGroup(SHARED_CONTRIBUTOR_KEYS),
      group_viewer: buildGroup(GROUP_VIEWER_KEYS),
      shared_viewer: buildGroup(SHARED_VIEWER_KEYS),
      group_lead: buildGroup(GROUP_LEAD_KEYS),
      shared_lead: buildGroup(SHARED_LEAD_KEYS),
      admin: buildGroup(ADMIN_KEYS),
      private: buildGroup(PRIVATE_SCOPE_KEYS),
    }
  }

  // Find or create the notification preference record for the current user.
  private async findOrCreateForCurrentUser(): Promise<NotificationPreference> {
    let pref = await this.repo.findOne({ user: this.user.id })

    if (!pref) {
      const userEntity = await this.user.loadEntity()
      pref = new NotificationPreference(userEntity)
      this.em.persist(pref)
    }

    return pref
  }

  // Update notification preferences for the current user (creates record if needed).
  async updatePreferences(updates: Partial<Record<PreferenceKey, boolean>>): Promise<void> {
    const pref = await this.findOrCreateForCurrentUser()
    const data = { ...(pref.data ?? DEFAULT_NOTIFICATION_PREFERENCES) }

    for (const key of ALL_PREFERENCE_KEYS) {
      const value = updates[key]
      if (typeof value === 'boolean') {
        data[key as keyof typeof data] = value
      }
    }

    pref.data = data
    await this.em.flush()
  }
}
