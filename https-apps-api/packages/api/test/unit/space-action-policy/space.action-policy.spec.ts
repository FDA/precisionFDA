import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { database } from '@pfda/https-apps-shared'
import { Space, SpaceMembership, User } from '@pfda/https-apps-shared/src/domain'
import { EntityManager } from '@mikro-orm/mysql'
import { spaceActionPolicy } from '@pfda/https-apps-shared/src/domain/space/space.action-policy'
import { SPACE_STATE, SPACE_TYPE } from '@pfda/https-apps-shared/src/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'
import { random } from '@pfda/https-apps-shared/src/test/generate'


describe('Space.action-policy ', () => {
	let em: EntityManager
	let user: User
	let rsaUser: User
	let groupSpace: Space
	let reviewSpace: Space
	let lockedSpace: Space

	let guestLead: User
	let hostLead: User

	let guestMembership: SpaceMembership
	let hostMembership: SpaceMembership
	let regularMembership: SpaceMembership


	beforeEach(async () => {
		await db.dropData(database.connection())
		// create DB mocks
		em = database.orm().em.fork() as EntityManager
		em.clear()
		rsaUser = create.userHelper.createRSA(em)
		user = create.userHelper.create(em)
		groupSpace = create.spacesHelper.create(em, generate.space.group())
		reviewSpace = create.spacesHelper.create(em)
		lockedSpace = create.spacesHelper.create(em, { state: SPACE_STATE.STATE_LOCKED })
		create.spacesHelper.addMember(em, { user, space: reviewSpace })
		guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
		hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
		regularMembership = create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })

		guestMembership = create.spacesHelper.addMember(
			em,
			{ user: guestLead, space: reviewSpace },
			{ role: SPACE_MEMBERSHIP_ROLE.LEAD },
		)
		hostMembership = create.spacesHelper.addMember(
			em,
			{ user: hostLead, space: reviewSpace },
			{
				role: SPACE_MEMBERSHIP_ROLE.LEAD,
				side: SPACE_MEMBERSHIP_SIDE.HOST
			},
		)
		await em.flush()
	})

	context('canLock()', () => {
		it('should return true - unlocked review space and user is RSA', async () => {
			const result = await spaceActionPolicy.canLock(reviewSpace, rsaUser)
			expect(result).to.be.true()
		})

		it('should return false - already locked review space', async () => {
			const result = await spaceActionPolicy.canLock(lockedSpace, rsaUser)
			expect(result).to.be.false()
		})

		it('should return false - not a review space', async () => {
			const result = await spaceActionPolicy.canLock(groupSpace, rsaUser)
			expect(result).to.be.false()
		})

		it('should return false - not a RSA user', async () => {
			const result = await spaceActionPolicy.canLock(reviewSpace, user)
			expect(result).to.be.false()
		})
	})

	context('canUnlock()', () => {
		it('should return true - locked review space and user is RSA', async () => {
			const result = await spaceActionPolicy.canUnlock(lockedSpace, rsaUser)
			expect(result).to.be.true()
		})

		it('should return false - already unlocked review space', async () => {
			const result = await spaceActionPolicy.canUnlock(reviewSpace, rsaUser)
			expect(result).to.be.false()
		})

		it('should return false - not a review space', async () => {
			const result = await spaceActionPolicy.canUnlock(groupSpace, rsaUser)
			expect(result).to.be.false()
		})

		it('should return false - not a RSA user', async () => {
			const result = await spaceActionPolicy.canUnlock(lockedSpace, user)
			expect(result).to.be.false()
		})
	})



	context('canAccept()', () => {
		it('should return true - not accepted review space and user is a lead', async () => {
			const confidentailSpace1 = create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, hostDxOrg: `org-pfda..space_host_${random.dxstr()}`, })
			const confidentailSpace2 = create.spacesHelper.create(em, { spaceId: reviewSpace.id, type: SPACE_TYPE.REVIEW, guestDxOrg: `org-pfda..space_guest_${random.dxstr()}`, })

			await em.flush()

			let result = spaceActionPolicy.canAccept(reviewSpace, [confidentailSpace1, confidentailSpace2], hostMembership)
			expect(result).to.be.true()
			result = spaceActionPolicy.canAccept(reviewSpace, [confidentailSpace1, confidentailSpace2], guestMembership)
			expect(result).to.be.true()
		})

		it('should return true - not accepted group space and user is a lead', async () => {
			guestMembership = create.spacesHelper.addMember(
				em,
				{ user: guestLead, space: groupSpace },
				{ role: SPACE_MEMBERSHIP_ROLE.LEAD },
			)
			hostMembership = create.spacesHelper.addMember(
				em,
				{ user: hostLead, space: groupSpace },
				{
					role: SPACE_MEMBERSHIP_ROLE.LEAD,
					side: SPACE_MEMBERSHIP_SIDE.HOST
				},
			)
			await em.flush()

			let result = spaceActionPolicy.canAccept(groupSpace, [], guestMembership)
			expect(result).to.be.true()
			result = spaceActionPolicy.canAccept(groupSpace, [], hostMembership)
			expect(result).to.be.true()
		})

		it('should return false - not accepted group space but user is a not a lead', async () => {
			const result = spaceActionPolicy.canAccept(groupSpace, [], regularMembership)
			expect(result).to.be.false()
		})

	})

})