import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { Space, User } from '@shared/domain'
import { create, db } from '@shared/test'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'

describe('space entity tests', () => {
  let em: EntityManager<MySqlDriver>
  let hostLead: User
  let guestLead: User
  let space: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    space = create.spacesHelper.create(em)
    hostLead = create.userHelper.create(em)
    guestLead = create.userHelper.create(em)
    await em.flush()

    create.spacesHelper.addMember(em, { user: hostLead, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST })
    create.spacesHelper.addMember(em, { user: guestLead, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST })

    await em.flush()
  })

  it('findHostLead works', async () => {
    const lead = await space.findHostLead()
    expect(lead?.dxuser).to.equal(hostLead.dxuser)
  })

  it('findGuestLead works', async () => {
    const lead = await space.findGuestLead()
    expect(lead?.dxuser).to.equal(guestLead.dxuser)
  })
})
