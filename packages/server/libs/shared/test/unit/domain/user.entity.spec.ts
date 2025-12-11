import { expect } from 'chai'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { database } from '@shared/database'
import { create, db } from '../../../src/test'
import type { EntityManager, MySqlDriver } from '@mikro-orm/mysql'

describe('User space methods', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let space1: Space
  let space2: Space
  let space3: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true })

    user = create.userHelper.create(em)
    await em.flush()
    space1 = create.spacesHelper.create(em, { state: SPACE_STATE.ACTIVE })
    space2 = create.spacesHelper.create(em, { state: SPACE_STATE.DELETED })
    space3 = create.spacesHelper.create(em, { state: SPACE_STATE.ACTIVE })
    await em.flush()
  })

  it('accessibleSpaces returns all active, non-deleted spaces', async () => {
    create.spacesHelper.addMember(
      em,
      { space: space1, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    create.spacesHelper.addMember(
      em,
      { space: space2, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: false, role: SPACE_MEMBERSHIP_ROLE.ADMIN },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    await em.flush()
    em.clear()

    const loadedUser = await em.findOne(User, user.id)
    const result = await loadedUser.accessibleSpaces()
    expect(result.map((s) => s.id)).to.have.members([space1.id, space3.id])
  })

  it('editableSpaces returns spaces for editable roles and active memberships', async () => {
    create.spacesHelper.addMember(
      em,
      { space: space1, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    create.spacesHelper.addMember(
      em,
      { space: space2, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    create.spacesHelper.addMember(
      em,
      { space: space2, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.ADMIN },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.ADMIN },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: false, role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    await em.flush()
    em.clear()

    const loadedUser = await em.findOneOrFail(User, user.id)
    const result = await loadedUser.editableSpaces()
    expect(result.map((s) => s.id)).to.have.members([space1.id, space3.id])
  })

  it('manageableSpaces returns spaces for lead/admin roles and active memberships', async () => {
    create.spacesHelper.addMember(
      em,
      { space: space1, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { space: space2, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.ADMIN },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.ADMIN },
    )
    create.spacesHelper.addMember(
      em,
      { space: space1, user },
      { active: true, role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    create.spacesHelper.addMember(
      em,
      { space: space3, user },
      { active: false, role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    await em.flush()
    em.clear()

    const loadedUser = await em.findOneOrFail(User, user.id)
    const result = await loadedUser.manageableSpaces()
    expect(result.map((s) => s.id)).to.have.members([space1.id, space3.id])
  })
})
