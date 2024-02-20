import type { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import {
	SPACE_MEMBERSHIP_ROLE,
	SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { create, db, generate } from '@shared/test'
import { random } from '@shared/test/generate'
import { PROJECT_DESCRIBE_RES } from '@shared/test/mock-responses'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('PATCH /spaces/:id/accept', () => {
  let em: EntityManager
  let notPermittedUser: User
  let user: User
  let groupSpace: Space
  let reviewSpace: Space

  let guestLead: User
  let hostLead: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    notPermittedUser = create.userHelper.create(em)
    user = create.userHelper.createRSA(em)
    groupSpace = create.spacesHelper.create(em, generate.space.group())
    reviewSpace = create.spacesHelper.create(em)

    guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    create.spacesHelper.addMember(em, { user, space: groupSpace })
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space: groupSpace },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )

    create.spacesHelper.addMember(em, { user, space: reviewSpace })
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space: reviewSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space: reviewSpace },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )

    await em.flush()
    mocksReset()
  })


  context('with host_lead', () => {
    it('creates a dnanexus project and invites both hosts', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${groupSpace.id}/accept`)
        .set(getDefaultHeaderData(hostLead))
        .expect(204)

      expect(fakes.client.projectCreateFake.calledOnce).to.be.true()
    })

    it('invites both hosts', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${groupSpace.id}/accept`)
        .set(getDefaultHeaderData(hostLead))
        .expect(204)

      expect(fakes.client.projectInviteFake.calledTwice).to.be.true()
    })

    it('adds user to the membership and accepts transfer projects when review space', async () => {
      fakes.client.projectDescribeFake.returns({ id: 'project-abc', pendingTransfer: 'user-mnb' })

      create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}` })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${reviewSpace.id}/accept`)
        .set(getDefaultHeaderData(hostLead))
        .expect(204)

      expect(fakes.client.projectInviteFake.notCalled).to.be.true()
      expect(fakes.client.projectCreateFake.notCalled).to.be.true()
      expect(fakes.client.projectDescribeFake.calledTwice).to.be.true()
      expect(fakes.client.projectAcceptTransferFake.calledTwice).to.be.true()

      // needs to clear identity map
      em.clear()
      const privateSpaces = await em.getRepository(Space).find(
        { spaceId: reviewSpace.id },
        { populate: ['spaceMemberships'] },
      )

      expect(privateSpaces[0].spaceMemberships.getItems().length).to.eq(1)
    })

    it('add user to the membership when review old space', async () => {
      fakes.client.projectDescribeFake.returns(PROJECT_DESCRIBE_RES)

      create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}` })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${reviewSpace.id}/accept`)
        .set(getDefaultHeaderData(hostLead))
        .expect(204)

      expect(fakes.client.projectInviteFake.notCalled).to.be.true()
      expect(fakes.client.projectCreateFake.notCalled).to.be.true()
      expect(fakes.client.projectDescribeFake.calledTwice).to.be.true()
      expect(fakes.client.projectAcceptTransferFake.notCalled).to.be.true()

      // needs to clear identity map
      em.clear()
      const privateSpaces = await em.getRepository(Space).find(
        { spaceId: reviewSpace.id },
        { populate: ['spaceMemberships'] },
      )

      expect(privateSpaces[0].spaceMemberships.getItems().length).to.eq(1)
    })
  })

  context('with guest_lead', () => {
    it('creates a dnanexus project and invites both hosts', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${groupSpace.id}/accept`)
        .set(getDefaultHeaderData(guestLead))
        .expect(204)

      expect(fakes.client.projectCreateFake.calledOnce).to.be.true()
    })

    it('invites both hosts', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${groupSpace.id}/accept`)
        .set(getDefaultHeaderData(guestLead))
        .expect(204)

      expect(fakes.client.projectInviteFake.calledTwice).to.be.true()
    })

    it('creates a dnanexus project and invites both guests when review space', async () => {
      create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}` })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/spaces/${reviewSpace.id}/accept`)
        .set(getDefaultHeaderData(guestLead))
        .expect(204)

      expect(fakes.client.projectCreateFake.calledTwice).to.be.true()
      expect(fakes.client.projectInviteFake.calledThrice).to.be.true()

      // needs to clear identity map
      em.clear()
      const privateSpaces = await em.getRepository(Space).find(
        { spaceId: reviewSpace.id },
        { populate: ['spaceMemberships'] },
      )

      expect(privateSpaces[1].spaceMemberships.getItems().length).to.eq(1)
    })
  })
})
