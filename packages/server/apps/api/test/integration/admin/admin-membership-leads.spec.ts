import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { USER_STATE, User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/admin/memberships/challenge-leads', () => {
  let em: EntityManager
  let requestUser: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    requestUser = create.userHelper.create(em, { dxuser: 'z_request_challenge_admin' })
    create.userHelper.addChallengeAdminRole(em, requestUser)
    create.sessionHelper.create(em, { user: requestUser })
  })

  it('returns sorted distinct host and guest challenge leads', async () => {
    const siteAdmin = create.userHelper.create(em, { dxuser: 'b_site_admin' })
    create.userHelper.addSiteAdminRole(em, siteAdmin)
    create.userHelper.addChallengeAdminRole(em, siteAdmin)

    const challengeAdmin = create.userHelper.create(em, { dxuser: 'a_challenge_admin' })
    create.userHelper.addChallengeAdminRole(em, challengeAdmin)

    const challengeEvaluator = create.userHelper.create(em, { dxuser: 'c_challenge_evaluator' })
    addChallengeEvaluatorRole(challengeEvaluator)

    const disabledChallengeAdmin = create.userHelper.create(em, {
      dxuser: 'disabled_challenge_admin',
      userState: USER_STATE.DEACTIVATED,
    })
    create.userHelper.addChallengeAdminRole(em, disabledChallengeAdmin)

    create.userHelper.create(em, { dxuser: 'd_regular_user' })

    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get('/admin/memberships/challenge-leads')
      .set(getDefaultHeaderData(requestUser))
      .expect(200)

    expect(body).to.deep.equal({
      hostUsernames: ['a_challenge_admin', 'b_site_admin', 'z_request_challenge_admin'],
      guestUsernames: ['a_challenge_admin', 'b_site_admin', 'c_challenge_evaluator', 'z_request_challenge_admin'],
    })
  })

  function addChallengeEvaluatorRole(user: User): void {
    const adminGroup = wrap(new AdminGroup()).assign({
      role: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR,
    })
    const adminMembership = wrap(new AdminMembership(user, adminGroup)).assign({}, { em })

    em.persist([adminGroup, adminMembership])
  }
})
