import { UserRepository } from '@shared/domain/user/user.repository'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UserManagementService } from '@shared/domain/user/service/user-management.service'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { ORG_EVERYONE } from '@shared/config/consts'
import { createRepositoryStub } from '../../factory/repository'
import { ValidationError } from '@shared/errors'

describe('user-management service tests', () => {
  const userUnlockStub = stub()
  const userResetMfaStub = stub()

  const userRepo = createRepositoryStub<User>()

  const getInstance = (): UserManagementService => {
    const platformClient = {
      userUnlock: userUnlockStub,
      userResetMfa: userResetMfaStub,
    } as unknown as PlatformClient

    return new UserManagementService(
      {
        id: 666,
        dxuser: 'user1',
        accessToken: 'access_token',
        loadEntity: () => null,
      },
      userRepo as unknown as UserRepository,
      platformClient,
    )
  }

  beforeEach(async () => {
    userRepo.stubs.reset()
    userUnlockStub.reset()
    userResetMfaStub.reset()
    userUnlockStub.throws()
    userResetMfaStub.throws()
  })

  describe('#deactivateUsers', () => {
    it('succeeds', async () => {
      const instance = getInstance()

      userRepo.stubs.find.resolves([
        { id: 1, userState: USER_STATE.ENABLED, dxuser: 'userA' },
        { id: 2, userState: USER_STATE.ENABLED, dxuser: 'userB' },
      ])

      await instance.deactivateUsers([1, 2])
      expect(userRepo.stubs.find.calledOnceWithExactly({ id: { $in: [1, 2] } })).to.be.true()
    })

    it('fails for themself', async () => {
      const instance = getInstance()

      await expect(instance.deactivateUsers([1, 666])).to.be.rejectedWith(
        ValidationError,
        'Cannot deactivate self',
      )
    })

    it('fails for non-enabled users', async () => {
      const instance = getInstance()

      userRepo.stubs.find.resolves([
        { id: 1, userState: USER_STATE.DEACTIVATED, dxid: 'user-userA', dxuser: 'userA' },
        { id: 2, userState: USER_STATE.ENABLED, dxid: 'user-userB', dxuser: 'userB' },
      ])

      await expect(instance.deactivateUsers([1, 2])).to.be.rejectedWith(
        ValidationError,
        'Cannot deactivate non-enabled users: userA',
      )
    })
  })

  describe('#activateUsers', () => {
    it('succeeds', async () => {
      const instance = getInstance()

      userRepo.stubs.find.resolves([
        { id: 1, userState: USER_STATE.DEACTIVATED, dxuser: 'userA' },
        { id: 2, userState: USER_STATE.DEACTIVATED, dxuser: 'userB' },
      ])

      await instance.activateUsers([1, 2])
      expect(userRepo.stubs.find.calledOnceWithExactly({ id: { $in: [1, 2] } })).to.be.true()
    })

    it('fails for themself', async () => {
      const instance = getInstance()

      await expect(instance.activateUsers([1, 666])).to.be.rejectedWith(
        ValidationError,
        'Cannot activate self',
      )
    })

    it('fails for non-deactivated users', async () => {
      const instance = getInstance()

      userRepo.stubs.find.resolves([
        { id: 1, userState: USER_STATE.ENABLED, dxid: 'user-userA', dxuser: 'userA' },
        { id: 2, userState: USER_STATE.DEACTIVATED, dxid: 'user-userB', dxuser: 'userB' },
      ])

      await expect(instance.deactivateUsers([1, 2])).to.be.rejectedWith(
        ValidationError,
        'Cannot deactivate non-enabled users: userB',
      )
    })
  })

  describe('#unlockUserAccount', () => {
    it('succeeds', async () => {
      const instance = getInstance()

      userRepo.stubs.findOneOrFail.resolves({ id: 1, dxid: 'user-userA', dxuser: 'userA' })
      userUnlockStub
        .withArgs({
          dxid: `user-userA`,
          data: {
            user_id: 'userA',
            org_id: ORG_EVERYONE,
          },
        })
        .resolves()

      await instance.unlockUserAccount(1)
      expect(userRepo.stubs.findOneOrFail.calledOnceWithExactly({ id: 1 })).to.be.true()
      expect(userUnlockStub.calledOnce).to.be.true()
    })
  })

  describe('#resetUserMfa', () => {
    it('succeeds', async () => {
      const instance = getInstance()

      userRepo.stubs.findOneOrFail.resolves({ id: 1, dxid: 'user-userA', dxuser: 'userA' })
      userResetMfaStub
        .withArgs({
          dxid: 'user-userA',
          data: {
            user_id: 'userA',
            org_id: ORG_EVERYONE,
          },
        })
        .resolves()
      await instance.resetUserMfa(1)
      expect(userRepo.stubs.findOneOrFail.calledOnceWithExactly({ id: 1 })).to.be.true()
      expect(userResetMfaStub.calledOnce).to.be.true()
    })
  })
})
