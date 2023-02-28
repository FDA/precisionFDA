import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { Space, User } from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { mocksReset, fakes } from '@pfda/https-apps-shared/src/test/mocks'
import { database } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'
import { SPACE_TYPE } from '@pfda/https-apps-shared/src/domain/space/space.enum'
import { random } from '@pfda/https-apps-shared/src/test/generate'

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
				side: SPACE_MEMBERSHIP_SIDE.HOST
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
				side: SPACE_MEMBERSHIP_SIDE.HOST
			},
		)

		await em.flush()
		mocksReset()
	})


	context('with host_lead', () => {
		it('creates a dnanexus project and invites both hosts', async () => {
			const { body } = await supertest(getServer())
				.patch(`/spaces/${groupSpace.id}/accept`)
				.query({ ...getDefaultQueryData(hostLead) })
				.expect(204)

			expect(fakes.client.projectCreateFake.calledOnce).to.be.true()
		})

		it('invites both hosts', async () => {
			const { body } = await supertest(getServer())
				.patch(`/spaces/${groupSpace.id}/accept`)
				.query({ ...getDefaultQueryData(hostLead) })
				.expect(204)

			expect(fakes.client.projectInviteFake.calledTwice).to.be.true()
		})

		it('adds user to the membership and does not call platform when review space', async () => {

			create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}`, })
			await em.flush()

			const { body } = await supertest(getServer())
				.patch(`/spaces/${reviewSpace.id}/accept`)
				.query({ ...getDefaultQueryData(hostLead) })
				.expect(204)

			expect(fakes.client.projectInviteFake.notCalled).to.be.true()
			expect(fakes.client.projectCreateFake.notCalled).to.be.true()

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
			const { body } = await supertest(getServer())
				.patch(`/spaces/${groupSpace.id}/accept`)
				.query({ ...getDefaultQueryData(guestLead) })
				.expect(204)

			expect(fakes.client.projectCreateFake.calledOnce).to.be.true()
		})

		it('invites both hosts', async () => {
			const { body } = await supertest(getServer())
				.patch(`/spaces/${groupSpace.id}/accept`)
				.query({ ...getDefaultQueryData(guestLead) })
				.expect(204)

			expect(fakes.client.projectInviteFake.calledTwice).to.be.true()
		})

		it('creates a dnanexus project and invites both guests when review space', async () => {

			create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}`, })
			await em.flush()

			const { body } = await supertest(getServer())
				.patch(`/spaces/${reviewSpace.id}/accept`)
				.query({ ...getDefaultQueryData(guestLead) })
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
