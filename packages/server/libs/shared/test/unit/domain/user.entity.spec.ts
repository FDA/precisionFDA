import { expect } from 'chai'
import { Collection } from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

describe('User space methods', () => {
  let user: User
  let space1: Space
  let space2: Space
  let space3: Space

  beforeEach(() => {
    const organization = new Organization()
    user = new User(organization)

    space1 = { id: '1', state: SPACE_STATE.ACTIVE } as unknown as Space
    space2 = { id: '2', state: SPACE_STATE.DELETED } as unknown as Space
    space3 = { id: '3', state: SPACE_STATE.ACTIVE } as unknown as Space
  })

  function attachMockMemberships(memberships: SpaceMembership[]): void {
    user.spaceMemberships = {
      load: async () => {},
      [Symbol.iterator]: function* () {
        yield* memberships
      },
    } as unknown as Collection<SpaceMembership>
  }

  describe('#accessibleSpaces', () => {
    it('returns all active, non-deleted spaces from active memberships', async () => {
      attachMockMemberships([
        { active: true, role: 'viewer', spaces: [space1, space2] } as unknown as SpaceMembership,
        { active: false, role: 'admin', spaces: [space3] } as unknown as SpaceMembership,
        { active: true, role: 'editor', spaces: [space3] } as unknown as SpaceMembership,
      ])

      const result = await user.accessibleSpaces()
      expect(result.map((s) => s.id)).to.have.members(['1', '3'])
    })
  })

  describe('#editableSpaces', () => {
    it('returns spaces where user has editable roles and space is active', async () => {
      attachMockMemberships([
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          spaces: [space1],
        } as unknown as SpaceMembership,
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
          spaces: [space2],
        } as unknown as SpaceMembership,
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.ADMIN,
          spaces: [space2, space3],
        } as unknown as SpaceMembership,
        {
          active: false,
          role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          spaces: [space3],
        } as unknown as SpaceMembership,
      ])

      const result = await user.editableSpaces()
      expect(result.map((s) => s.id)).to.have.members(['1', '3'])
    })
  })

  describe('#manageableSpaces', () => {
    it('returns spaces where user is lead or admin and space is active', async () => {
      attachMockMemberships([
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.LEAD,
          spaces: [space1],
        } as unknown as SpaceMembership,
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.ADMIN,
          spaces: [space2, space3],
        } as unknown as SpaceMembership,
        {
          active: true,
          role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          spaces: [space1],
        } as unknown as SpaceMembership,
        {
          active: false,
          role: SPACE_MEMBERSHIP_ROLE.LEAD,
          spaces: [space3],
        } as unknown as SpaceMembership,
      ])

      const result = await user.manageableSpaces()
      expect(result.map((s) => s.id)).to.have.members(['1', '3'])
    })
  })
})
