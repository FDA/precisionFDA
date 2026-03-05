import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { License } from '@shared/domain/license/license.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { create, db } from '../../../src/test'

describe('AcceptedLicenseService', () => {
  let em: EntityManager<MySqlDriver>
  let acceptedLicenseRepository: AcceptedLicenseRepository
  let userCtx: UserContext
  let user: User
  let license: License

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    await em.clear()

    user = create.userHelper.create(em)
    license = create.licenseHelper.create(em, { user })
    await em.flush()
    acceptedLicenseRepository = new AcceptedLicenseRepository(em, AcceptedLicense)
    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: () => Promise.resolve(user),
    } as UserContext
  })

  context('acceptLicenseForUser', () => {
    it('should return accepted licenses for the user', async () => {
      const acceptedLicense1 = create.acceptedLicenseHelper.create(em, { user, license }, {})
      const anotherUser = create.userHelper.create(em)
      const acceptedLicense2 = create.acceptedLicenseHelper.create(
        em,
        { user: anotherUser, license },
        {},
      )
      await em.flush()

      const acceptedLicenseService = getInstance()
      const result = await acceptedLicenseService.acceptLicenseForUser()

      expect(result.length).to.equal(1)
      const acceptedLicenseIds = result.map((al) => al.id)
      expect(acceptedLicenseIds).to.include.members([acceptedLicense1.id])
      expect(acceptedLicenseIds).to.not.include(acceptedLicense2.id)
    })
  })

  context('isLicenseAcceptedForUser', () => {
    it('should return true if the license is accepted by the user', async () => {
      create.acceptedLicenseHelper.create(em, { user, license }, {})
      await em.flush()

      const acceptedLicenseService = getInstance()
      const result = await acceptedLicenseService.isLicenseAcceptedForUser(license.id)

      expect(result).to.be.true()
    })

    it('should return false if the license is not accepted by the user', async () => {
      const acceptedLicenseService = getInstance()
      const result = await acceptedLicenseService.isLicenseAcceptedForUser(license.id)

      expect(result).to.be.false()
    })
  })

  function getInstance(): AcceptedLicenseService {
    return new AcceptedLicenseService(userCtx, acceptedLicenseRepository)
  }
})
