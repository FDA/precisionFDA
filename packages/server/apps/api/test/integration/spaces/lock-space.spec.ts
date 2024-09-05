import type { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'
import * as process from 'process'

describe('PATCH /spaces/:id/lock', () => {
  let em: EntityManager
  let user: User
  let space: Space
  let alreadyLockedSpace: Space
  let groupSpace: Space
  let guestLead: User
  let hostLead: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    create.userHelper.create(em)
    user = create.userHelper.createRSA(em)
    space = create.spacesHelper.create(em)
    alreadyLockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.LOCKED })
    guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    create.spacesHelper.addMember(em, { user, space })

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
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )

    await em.flush()
    mocksReset()
  })

  it('locks space', async () => {
    await supertest(testedApp.getHttpServer())
      .patch(`/spaces/${space.id}/lock`)
      .set(getDefaultHeaderData(user))
      .expect(204)

    const sendEmailStub = fakes.emailService.sendEmail
    expect(sendEmailStub.calledTwice).to.be.true()

    const firstEmail = sendEmailStub.args[0][0]
    expect(firstEmail).to.include({
      emailType: 4,
      to: guestLead.email,
      subject: `[${process.env.NODE_ENV}] ${user.fullName} locked the space ${space.name}`,
    })
    expect(firstEmail.body).to.include('SPACE locked')
    expect(firstEmail.body).to.include(`Hello ${guestLead.firstName}!`)
    expect(firstEmail.body).to.include(`The space ${space.name} was locked`)

    const secondEmail = sendEmailStub.args[1][0]
    expect(secondEmail).to.include({
      emailType: 4,
      to: hostLead.email,
      subject: `[${process.env.NODE_ENV}] ${user.fullName} locked the space ${space.name}`,
    })
    expect(secondEmail.body).to.include('SPACE locked')
    expect(secondEmail.body).to.include(`Hello ${hostLead.firstName}!`)
    expect(secondEmail.body).to.include(`The space ${space.name} was locked`)

    em.clear()
    const lockedSpace = await em.getRepository(Space).findOneOrFail({ id: space.id })

    expect(lockedSpace.state).to.be.equal(SPACE_STATE.LOCKED)
  })

  context('error states', () => {
    it('throws 404 when the space does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch('/spaces/4848/lock')
        .set(getDefaultHeaderData(user))
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.SPACE_NOT_FOUND)
    })

    it('does not allow to lock space (user is not RSA) and returns 403', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${space.id}/lock`)
        .set(getDefaultHeaderData(hostLead))
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })

    it('does not allow to lock space (space already locked) and returns 403', async () => {
      alreadyLockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.LOCKED })
      create.spacesHelper.addMember(em, { user, space: alreadyLockedSpace })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${alreadyLockedSpace.id}/lock`)
        .set(getDefaultHeaderData(user))
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })

    it('does not allow to lock space (only review space can be locked) and returns 403', async () => {
      groupSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(em, { user, space: groupSpace })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${groupSpace.id}/lock`)
        .set(getDefaultHeaderData(user)) // different user has to do this in order to fail? i guess.
        .send({})
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })
  })
})
