import { database } from '@shared/database'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { create, generate, db } from '@shared/test'
import { mocksReset, fakes } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SPACE_STATE } from '@shared/domain/space/space.enum'

describe('PATCH /spaces/:id/unlock', () => {
  let em: EntityManager
  let notPermittedUser: User
  let user: User
  let space: Space
  let alreadyUnlockedSpace: Space
  let guestLead: User
  let hostLead: User

  let spaceMembership: SpaceMembership

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    notPermittedUser = create.userHelper.create(em)
    user = create.userHelper.createRSA(em)
    space = create.spacesHelper.create(em, { state: SPACE_STATE.LOCKED })
    alreadyUnlockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.ACTIVE })
    guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    spaceMembership = create.spacesHelper.addMember(em, { user, space })

    create.spacesHelper.addMember(
      em,
      { user: guestLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST
      },
    )

    await em.flush()
    mocksReset()
  })


  it('unlocks space', async () => {
    await supertest(testedApp.getHttpServer())
      .patch(`/spaces/${space.id}/unlock`)
      .set(getDefaultHeaderData(user))
      .expect(204)

    expect(fakes.queue.createEmailSendTaskFake.calledTwice).to.be.true()
    em.clear()
    const unlockedSpace = await em.getRepository(Space).findOneOrFail({ id: space.id })
    expect(unlockedSpace.state).to.be.equal(SPACE_STATE.ACTIVE)
  })

  context('error states', () => {
    it('throws 404 when the space does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/4848/unlock`)
        .set(getDefaultHeaderData(user))
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.SPACE_NOT_FOUND)
    })

    it('does not allow to unlock space (user is not RSA) and returns 403', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${space.id}/unlock`)
        .set(getDefaultHeaderData(hostLead))
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })

    it('does not allow to unlock space (space already unlocked) and returns 403', async () => {
      alreadyUnlockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.ACTIVE })
      create.spacesHelper.addMember(em, { user, space: alreadyUnlockedSpace })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${alreadyUnlockedSpace.id}/unlock`)
        .set(getDefaultHeaderData(user))
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })

  })
})
