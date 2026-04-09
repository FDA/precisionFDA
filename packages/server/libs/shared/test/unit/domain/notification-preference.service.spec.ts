import { SqlEntityManager } from '@mikro-orm/mysql'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import { SinonStub, stub } from 'sinon'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@shared/domain/notification-preference/notification-preference.config'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { NotificationPreferenceRepository } from '@shared/domain/notification-preference/notification-preference.repository'
import {
  NotificationPreferenceService,
  PreferenceKey,
} from '@shared/domain/notification-preference/notification-preference.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'

chai.use(dirtyChai)

describe('NotificationPreferenceService', () => {
  const USER_ID = 42

  let findOneStub: SinonStub
  let persistStub: SinonStub
  let flushStub: SinonStub

  beforeEach(() => {
    findOneStub = stub()
    persistStub = stub()
    flushStub = stub()
  })

  describe('getGroupedPreferences', () => {
    it('should return defaults when no preference record exists', async () => {
      findOneStub.resolves(null)

      const service = getInstance()
      const result = await service.getGroupedPreferences()

      // Should have all 8 groups
      expect(result).to.have.all.keys(
        'group_contributor',
        'shared_contributor',
        'group_viewer',
        'shared_viewer',
        'group_lead',
        'shared_lead',
        'admin',
        'private',
      )

      // Verify defaults match DEFAULT_NOTIFICATION_PREFERENCES
      expect(result.group_lead.group_lead_membership_changed).to.equal(true)
      expect(result.group_contributor.group_contributor_membership_changed).to.equal(false)
      expect(result.private.private_job_finished).to.equal(false)
      expect(result.private.private_challenge_opened).to.equal(true)
    })

    it('should return stored values when preference record exists', async () => {
      const storedData = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        group_lead_membership_changed: false,
        private_job_finished: true,
      }

      const pref = { data: storedData } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      const result = await service.getGroupedPreferences()

      expect(result.group_lead.group_lead_membership_changed).to.equal(false)
      expect(result.private.private_job_finished).to.equal(true)
    })

    it('should look up existing preferences by user id', async () => {
      const pref = { data: DEFAULT_NOTIFICATION_PREFERENCES } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      await service.getGroupedPreferences()

      expect(findOneStub.calledOnce).to.be.true()
      expect(findOneStub.firstCall.args[0]).to.deep.equal({ user: USER_ID })
    })

    it('should not create a record when one already exists', async () => {
      const pref = { data: DEFAULT_NOTIFICATION_PREFERENCES } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      await service.getGroupedPreferences()

      expect(persistStub.notCalled).to.be.true()
    })

    it('should default missing keys to false', async () => {
      // Simulate a stored record missing some keys (e.g. newly added preference)
      const partialData = { ...DEFAULT_NOTIFICATION_PREFERENCES }
      delete (partialData as Record<string, unknown>).private_job_stale

      const pref = { data: partialData } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      const result = await service.getGroupedPreferences()

      // Missing key should fall back to the default (false for private_job_stale)
      expect(result.private.private_job_stale).to.equal(false)
    })

    it('should include correct keys in each group', async () => {
      const pref = { data: DEFAULT_NOTIFICATION_PREFERENCES } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      const result = await service.getGroupedPreferences()

      expect(result.group_contributor).to.have.all.keys(
        'group_contributor_membership_changed',
        'group_contributor_comment_activity',
        'group_contributor_content_added_or_deleted',
      )
      expect(result.group_lead).to.have.all.keys(
        'group_lead_membership_changed',
        'group_lead_comment_activity',
        'group_lead_content_added_or_deleted',
        'group_lead_member_added_to_space',
        'group_lead_space_locked_unlocked_deleted',
      )
      expect(result.private).to.have.all.keys(
        'private_job_finished',
        'private_challenge_opened',
        'private_challenge_preregister',
        'private_job_stale',
      )
    })
  })

  describe('updatePreferences', () => {
    it('should update specified keys and flush', async () => {
      const storedData = { ...DEFAULT_NOTIFICATION_PREFERENCES }
      const pref = { data: storedData } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      await service.updatePreferences({
        group_lead_membership_changed: false,
        private_job_finished: true,
      })

      expect(pref.data.group_lead_membership_changed).to.equal(false)
      expect(pref.data.private_job_finished).to.equal(true)
      expect(flushStub.calledOnce).to.be.true()
    })

    it('should not modify keys that are not in the update payload', async () => {
      const storedData = { ...DEFAULT_NOTIFICATION_PREFERENCES }
      const pref = { data: storedData } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const originalValue = DEFAULT_NOTIFICATION_PREFERENCES.group_lead_comment_activity

      const service = getInstance()
      await service.updatePreferences({
        group_lead_membership_changed: false,
      })

      // Other keys should remain unchanged
      expect(pref.data.group_lead_comment_activity).to.equal(originalValue)
    })

    it('should ignore unknown keys in the payload', async () => {
      const storedData = { ...DEFAULT_NOTIFICATION_PREFERENCES }
      const pref = { data: storedData } as unknown as NotificationPreference
      findOneStub.resolves(pref)

      const service = getInstance()
      await service.updatePreferences({
        totally_fake_key: true,
      } as Partial<Record<PreferenceKey, boolean>>)

      // Should not have added the fake key
      expect(pref.data).to.not.have.property('totally_fake_key')
      expect(flushStub.calledOnce).to.be.true()
    })

    it('should apply updates even when preference record is freshly created', async () => {
      const newPref = { data: { ...DEFAULT_NOTIFICATION_PREFERENCES } } as unknown as NotificationPreference

      const service = getInstance()
      stub(service, 'findOrCreateForCurrentUser').resolves(newPref)

      await service.updatePreferences({
        private_job_finished: true,
      })

      expect(newPref.data.private_job_finished).to.equal(true)
      expect(flushStub.calledOnce).to.be.true()
    })
  })

  function getInstance(): NotificationPreferenceService {
    const em = {
      persist: persistStub,
      flush: flushStub,
    } as unknown as SqlEntityManager

    const repo = {
      findOne: findOneStub,
    } as unknown as NotificationPreferenceRepository

    const user = {
      id: USER_ID,
      loadEntity: stub().resolves({ id: USER_ID } as User),
    } as unknown as UserContext

    return new NotificationPreferenceService(em, user, repo)
  }
})
