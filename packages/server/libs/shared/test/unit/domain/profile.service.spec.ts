import { expect } from 'chai'
import { stub } from 'sinon'
import { InvalidStateError } from '@shared/errors'
import { ProfileService } from '@shared/domain/profile/service/profile.service'
import { UpdateProfileDTO } from '@shared/domain/profile/dto/update-profile.dto'
import { User } from '@shared/domain/user/user.entity'
import { Profile } from '@shared/domain/profile/profile.entity'
import { ProfileRepository } from '@shared/domain/profile/profile.repository'
import { PlatformClient } from '@shared/platform-client'
import { EntityManager } from '@mikro-orm/mysql'

describe('ProfileService', () => {
  const findByUserIdStub = stub()
  const findByEmailStub = stub()
  const flushStub = stub()
  const persistStub = stub()
  const persistAndFlushStub = stub()
  const userUpdateEmailStub = stub()

  const profile = {
    id: 10,
    email: 'old@example.com',
    emailConfirmed: true,
  } as unknown as Profile

  const user = {
    id: 1,
    dxid: 'user-1',
    email: 'user@example.com',
    normalizedEmail: 'user@example.com',
  } as unknown as User

  const em = {
    flush: flushStub,
    persist: persistStub,
    persistAndFlush: persistAndFlushStub,
  } as unknown as EntityManager

  const profileRepository = {
    findByUserId: findByUserIdStub,
    findByEmail: findByEmailStub,
  } as unknown as ProfileRepository

  const platformClient = {
    userUpdateEmail: userUpdateEmailStub,
  } as unknown as PlatformClient

  beforeEach(() => {
    findByUserIdStub.reset()
    findByEmailStub.reset()
    flushStub.reset()
    persistStub.reset()
    persistAndFlushStub.reset()
    userUpdateEmailStub.reset()

    findByUserIdStub.resolves(profile)
    findByEmailStub.resolves(null)
    flushStub.resolves()
    userUpdateEmailStub.resolves({})
  })

  it('fails fast on missing password/otp before checking email uniqueness', async () => {
    const service = getInstance()
    const dto: UpdateProfileDTO = {
      email: 'new@example.com',
    }

    await expect(service.updateProfile(user, dto)).to.be.rejectedWith(
      InvalidStateError,
      'Password and OTP are required to change email',
    )

    expect(findByEmailStub.notCalled).to.be.true()
    expect(userUpdateEmailStub.notCalled).to.be.true()
  })

  it('checks email uniqueness only after password/otp are present', async () => {
    const service = getInstance()
    const dto: UpdateProfileDTO = {
      email: 'new@example.com',
      password: 'secret',
      otp: '123456',
    }

    const result = await service.updateProfile(user, dto)

    expect(findByEmailStub.calledOnceWithExactly('new@example.com')).to.be.true()
    expect(userUpdateEmailStub.calledOnce).to.be.true()
    expect(result.email).to.equal('new@example.com')
    expect(user.email).to.equal('user@example.com')
    expect(user.normalizedEmail).to.equal('user@example.com')
  })

  function getInstance(): ProfileService {
    return new ProfileService(em, profileRepository, platformClient)
  }
})
