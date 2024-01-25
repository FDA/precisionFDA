import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { Organization } from '@shared/domain/org/org.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { create, db } from '@shared/test'

describe('org entity tests', () => {
  let em: EntityManager<MySqlDriver>
  let org: Organization
  let user: User
  let legacyOrg: Organization
  let legacyOrgUsers: User[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    org = create.orgHelper.create(em)
    user = create.userHelper.createUsingOrg(em, org)

    legacyOrg = create.orgHelper.create(em)
    legacyOrgUsers = [
      create.userHelper.createUsingOrg(em, legacyOrg),
      create.userHelper.createUsingOrg(em, legacyOrg),
      create.userHelper.createUsingOrg(em, legacyOrg),
      create.userHelper.createUsingOrg(em, legacyOrg),
    ]
    await em.flush()
  })

  it('resolves relations for normal org', async () => {
    const orgFromDb = await em.getRepository(Organization).findOne({ id: org.id })
    expect(orgFromDb?.users).to.have.length(1)
    expect(orgFromDb?.users[0]).to.equal(user)
  })

  it('resolves relations for legacy org', async () => {
    const orgFromDb = await em.getRepository(Organization).findOne({ id: legacyOrg.id })
    expect(orgFromDb?.users).to.have.length(4)
    expect(orgFromDb?.users[0].dxuser).to.equal(legacyOrgUsers[0].dxuser)
    expect(orgFromDb?.users[1].dxuser).to.equal(legacyOrgUsers[1].dxuser)
    expect(orgFromDb?.users[2].dxuser).to.equal(legacyOrgUsers[2].dxuser)
    expect(orgFromDb?.users[3].dxuser).to.equal(legacyOrgUsers[3].dxuser)

    expect(orgFromDb?.isLegacy()).to.be.true()
  })
})
