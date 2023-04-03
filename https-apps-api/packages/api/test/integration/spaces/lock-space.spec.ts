import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { Space, SpaceMembership, User } from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { mocksReset, fakes } from '@pfda/https-apps-shared/src/test/mocks'
import { errors, database } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'
import { SPACE_STATE } from '@pfda/https-apps-shared/src/domain/space/space.enum'

describe('PATCH /spaces/:id/lock', () => {
	let em: EntityManager
	let notPermittedUser: User
	let user: User
	let space: Space
	let alreadyLockedSpace: Space
	let groupSpace: Space
	let guestLead: User
	let hostLead: User

	let spaceMembership: SpaceMembership

	beforeEach(async () => {
		await db.dropData(database.connection())
		// create DB mocks
		em = database.orm().em.fork() as EntityManager
		em.clear()
		notPermittedUser = create.userHelper.create(em)
		user = create.userHelper.createRSA(em)
		space = create.spacesHelper.create(em)
		alreadyLockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.LOCKED })
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


	it('locks space', async () => {
		await supertest(getServer())
			.patch(`/spaces/${space.id}/lock`)
			.query({ ...getDefaultQueryData(user) })
			.expect(204)

		expect(fakes.queue.createEmailSendTaskFake.calledTwice).to.be.true()
		em.clear()
		const lockedSpace = await em.getRepository(Space).findOneOrFail({ id: space.id })
		expect(lockedSpace.state).to.be.equal(SPACE_STATE.LOCKED)
	})

	context('error states', () => {
		it('throws 404 when the space does not exist', async () => {
			const { body } = await supertest(getServer())
				.patch(`/spaces/4848/lock`)
				.query({ ...getDefaultQueryData(user) })
				.expect(404)
			expect(body.error).to.have.property('code', errors.ErrorCodes.SPACE_NOT_FOUND)
		})

		it('does not allow to lock space (user is not RSA) and returns 403', async () => {
			const { body } = await supertest(getServer())
				.patch(`/spaces/${space.id}/lock`)
				.query({ ...getDefaultQueryData(hostLead) })
				.expect(403)
			expect(body.error).to.have.property('code', errors.ErrorCodes.NOT_PERMITTED)
		})

		it('does not allow to lock space (space already locked) and returns 403', async () => {
			alreadyLockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.LOCKED })
			create.spacesHelper.addMember(em, { user, space: alreadyLockedSpace })
			await em.flush()

			const { body } = await supertest(getServer())
				.patch(`/spaces/${alreadyLockedSpace.id}/lock`)
				.query({ ...getDefaultQueryData(user) })
				.expect(403)
			expect(body.error).to.have.property('code', errors.ErrorCodes.NOT_PERMITTED)
		})

		it('does not allow to lock space (only review space can be locked) and returns 403', async () => {

			groupSpace = create.spacesHelper.create(em, generate.space.group())
			create.spacesHelper.addMember(em, { user, space: groupSpace })
			await em.flush()

			const { body } = await supertest(getServer())
				.patch(`/spaces/${groupSpace.id}/lock`)
				.query({ ...getDefaultQueryData(user) }) // different user has to do this in order to fail? i guess.
				.send({})
				.expect(403)
			expect(body.error).to.have.property('code', errors.ErrorCodes.NOT_PERMITTED)
		})


	})
})
