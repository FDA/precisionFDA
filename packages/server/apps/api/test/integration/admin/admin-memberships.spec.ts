import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/admin/memberships', () => {
  let em: EntityManager
  let siteAdmin: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    siteAdmin = create.userHelper.createSiteAdmin(em)
    create.sessionHelper.create(em, { user: siteAdmin })
    await em.flush()
    mocksReset()
  })

  describe('GET /admin/memberships/users', () => {
    it('returns 403 for non-site-admin requester', async () => {
      const regularUser = create.userHelper.create(em)
      create.sessionHelper.create(em, { user: regularUser })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .get('/admin/memberships/users')
        .set(getDefaultHeaderData(regularUser))
        .expect(403)
    })

    it('returns 200 with paginated list of users with admin roles', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/admin/memberships/users')
        .set(getDefaultHeaderData(siteAdmin))
        .expect(200)

      expect(body.meta).to.exist()
      expect(body.data).to.be.an('array')
      expect(body.data.some((u: any) => u.id === siteAdmin.id)).to.be.true()
    })

    it('filters results by dxuser', async () => {
      const rsaUser = create.userHelper.createRSA(em)
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/admin/memberships/users?filter[dxuser]=${rsaUser.dxuser}`)
        .set(getDefaultHeaderData(siteAdmin))
        .expect(200)

      expect(body.data).to.have.length(1)
      expect(body.data[0].dxuser).to.equal(rsaUser.dxuser)
    })

    it('filters results by role', async () => {
      const rsaUser = create.userHelper.createRSA(em)
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/admin/memberships/users?role=${ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN}`)
        .set(getDefaultHeaderData(siteAdmin))
        .expect(200)

      expect(body.data).to.be.an('array')
      expect(body.data.some((u: any) => u.id === rsaUser.id)).to.be.true()
      const rsaUserInResult = body.data.find((u: any) => u.id === rsaUser.id)
      expect(rsaUserInResult.adminRoles).to.include(ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN)
    })
  })

  describe('POST /admin/memberships', () => {
    it('returns 403 for non-site-admin requester', async () => {
      const regularUser = create.userHelper.create(em)
      create.sessionHelper.create(em, { user: regularUser })
      const targetUser = create.userHelper.create(em)
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/admin/memberships')
        .set(getDefaultHeaderData(regularUser))
        .send({ userId: targetUser.id, group: ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN })
        .expect(403)
    })

    it('creates a ROLE_REVIEW_SPACE_ADMIN membership without calling platform APIs', async () => {
      const targetUser = create.userHelper.create(em)
      create.userHelper.createRSA(em) // seeds the ROLE_REVIEW_SPACE_ADMIN AdminGroup as a side-effect
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/admin/memberships')
        .set(getDefaultHeaderData(siteAdmin))
        .send({ userId: targetUser.id, group: ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN })
        .expect(201)

      expect(body.id).to.be.a('number')
      expect(fakes.client.inviteUserToOrganizationFake.notCalled).to.be.true()

      em.clear()
      const membership = await em.findOne(AdminMembership, { user: targetUser.id })
      expect(membership).to.not.be.null()
    })

    it('creates a ROLE_SITE_ADMIN membership and calls platform APIs', async () => {
      const targetUser = create.userHelper.create(em)
      create.spacesHelper.create(em, {
        type: SPACE_TYPE.ADMINISTRATOR,
        hostProject: 'project-test123',
      })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/admin/memberships')
        .set(getDefaultHeaderData(siteAdmin))
        .send({ userId: targetUser.id, group: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN })
        .expect(201)

      expect(body.id).to.be.a('number')
      expect(fakes.client.inviteUserToOrganizationFake.calledOnce).to.be.true()
      expect(fakes.client.projectInviteFake.calledOnce).to.be.true()

      em.clear()
      const membership = await em.findOne(AdminMembership, { user: targetUser.id })
      expect(membership).to.not.be.null()
    })

    it('returns 422 when userId does not exist', async () => {
      await supertest(testedApp.getHttpServer())
        .post('/admin/memberships')
        .set(getDefaultHeaderData(siteAdmin))
        .send({ userId: 99999, group: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN })
        .expect(422)
    })
  })

  describe('DELETE /admin/memberships/:id', () => {
    it('returns 403 for non-site-admin requester', async () => {
      const regularUser = create.userHelper.create(em)
      create.sessionHelper.create(em, { user: regularUser })
      await em.flush()

      const membership = await em.findOneOrFail(AdminMembership, { user: siteAdmin })

      await supertest(testedApp.getHttpServer())
        .delete(`/admin/memberships/${membership.id}`)
        .set(getDefaultHeaderData(regularUser))
        .expect(403)
    })

    it('removes a non-ROLE_SITE_ADMIN membership and returns 204', async () => {
      const rsaUser = create.userHelper.createRSA(em)
      await em.flush()

      const membership = await em.findOneOrFail(AdminMembership, { user: rsaUser })
      const membershipId = membership.id

      await supertest(testedApp.getHttpServer())
        .delete(`/admin/memberships/${membershipId}`)
        .set(getDefaultHeaderData(siteAdmin))
        .expect(204)

      em.clear()
      const deleted = await em.findOne(AdminMembership, membershipId)
      expect(deleted).to.be.null()
    })

    it('removing ROLE_SITE_ADMIN membership calls removeUserFromOrganization', async () => {
      const targetUser = create.userHelper.create(em)
      await em.flush()

      const siteAdminGroup = await em.findOneOrFail(AdminGroup, {
        role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
      })
      const targetMembership = new AdminMembership(targetUser, siteAdminGroup)
      em.persist(targetMembership)
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .delete(`/admin/memberships/${targetMembership.id}`)
        .set(getDefaultHeaderData(siteAdmin))
        .expect(204)

      expect(fakes.client.removeUserFromOrganizationFake.called).to.be.true()
    })

    it('returns 403 when removing site admin role from the root admin user', async () => {
      const rootAdmin = create.userHelper.createAdmin(em)
      await em.flush()

      const siteAdminGroup = await em.findOneOrFail(AdminGroup, {
        role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
      })
      const rootAdminMembership = new AdminMembership(rootAdmin, siteAdminGroup)
      em.persist(rootAdminMembership)
      await em.flush()

      const membershipId = rootAdminMembership.id

      await supertest(testedApp.getHttpServer())
        .delete(`/admin/memberships/${membershipId}`)
        .set(getDefaultHeaderData(siteAdmin))
        .expect(403)

      em.clear()
      const stillExists = await em.findOne(AdminMembership, membershipId)
      expect(stillExists).to.not.be.null()
    })

    it('returns 422 when membership does not exist', async () => {
      await supertest(testedApp.getHttpServer())
        .delete('/admin/memberships/99999')
        .set(getDefaultHeaderData(siteAdmin))
        .expect(422)
    })
  })
})
