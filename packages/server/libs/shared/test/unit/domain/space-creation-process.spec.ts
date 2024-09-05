import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdministratorSpaceCreationProcess } from '@shared/domain/space/create/administrator-space-creation.process'
import { GovernmentSpaceCreationProcess } from '@shared/domain/space/create/government-space-creation.process'
import { PrivateSpaceCreationProcess } from '@shared/domain/space/create/private-space-creation.process'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { User } from '@shared/domain/user/user.entity'
import { ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import * as generate from '@shared/test/generate'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db } from '../../../src/test'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { PlatformClient } from '@shared/platform-client'

describe('space creation process tests', () => {

  let userCtx: UserCtx
  let user: User
  let em: EntityManager<MySqlDriver>
  let platformClient: PlatformClient
  let adminPlatformClient: PlatformClient
  let spaceNotificationService: SpaceNotificationService

  const createOrgStub = stub()
  const inviteUserToOrgStub = stub()
  const projectCreateStub = stub()
  const projectInviteStub = stub()
  const notifySpaceCreatedStub = stub()
  const removeUserFromOrganizationStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    platformClient = {
      inviteUserToOrganization: inviteUserToOrgStub,
      createOrg: createOrgStub,
      projectCreate: projectCreateStub,
      projectInvite: projectInviteStub,
    } as unknown as PlatformClient

    adminPlatformClient = {
      inviteUserToOrganization: inviteUserToOrgStub,
      createOrg: createOrgStub,
      projectCreate: projectCreateStub,
      projectInvite: projectInviteStub,
      removeUserFromOrganization: removeUserFromOrganizationStub
    } as unknown as PlatformClient

    spaceNotificationService = {
      notifySpaceCreated: notifySpaceCreatedStub,
    } as unknown as SpaceNotificationService

    createOrgStub.reset()
    inviteUserToOrgStub.reset()
    projectCreateStub.reset()
    projectInviteStub.reset()
    notifySpaceCreatedStub.reset()
    removeUserFromOrganizationStub.reset()

    projectCreateStub.returns({ id: `project-${generate.random.dxstr()}` } as ClassIdResponse)
    createOrgStub.returns({ id: `org-${generate.random.dxstr()}` } as ClassIdResponse)

  })

  it('create groups space as site admin', async () => {
    user = create.userHelper.createSiteAdmin(em)
    const hostLead = create.userHelper.create(em)
    const guestLead = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GROUPS
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = hostLead.dxuser
    input.guestLeadDxuser = guestLead.dxuser
    input.protected = true
    input.forChallenge = false
    input.restrictedReviewer = false

    const res = await groupsProcess().build(input)
    expect(res).eq(1)
    expect(createOrgStub.calledTwice).to.be.true()
    expect(inviteUserToOrgStub.callCount).to.be.eq(4)
    expect(projectCreateStub.calledTwice).to.be.true()
    expect(projectInviteStub.callCount).to.eq(4)
    expect(notifySpaceCreatedStub.calledTwice).to.be.true()
  })

  it('create challenge groups space as site admin', async () => {
    user = create.userHelper.createSiteAdmin(em)
    create.userHelper.createChallengeBot(em)
    const hostLead = create.userHelper.create(em)
    const guestLead = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GROUPS
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = hostLead.dxuser
    input.guestLeadDxuser = guestLead.dxuser
    input.protected = false
    input.forChallenge = true
    input.restrictedReviewer = false

    const res = await groupsProcess().build(input)
    expect(res).eq(1)
    expect(createOrgStub.calledTwice).to.be.true()
    expect(inviteUserToOrgStub.callCount).to.be.eq(6)
    expect(projectCreateStub.calledTwice).to.be.true()
    expect(projectInviteStub.callCount).to.eq(4)
    expect(notifySpaceCreatedStub.calledTwice).to.be.true()
  })

  it('create groups space as non-admin - should fail', async () => {
    user = create.userHelper.create(em)
    const hostLead = create.userHelper.create(em)
    const guestLead = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GROUPS
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = hostLead.dxuser
    input.guestLeadDxuser = guestLead.dxuser
    input.protected = true
    input.forChallenge = false
    input.restrictedReviewer = false

    try {
      await groupsProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only admins can create Groups spaces')
    }
  })

  it('create private space', async () => {
    user = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.PRIVATE_TYPE
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = user.dxuser

    const res = await privateProcess().build(input)
    expect(res).eq(1)
    expect(createOrgStub.calledOnce).to.be.true()
  })

  it('create private space for another user - should fail', async () => {
    user = create.userHelper.create(em)
    const differentUser = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.PRIVATE_TYPE
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = differentUser.dxuser


    try {
      await privateProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('You are not allowed to create new Private Space for another user!')
    }
  })

  it('create administrator space', async () => {
    user = create.userHelper.createSiteAdmin(em)
    const adminGroup = await em.findOne(AdminGroup, { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN })
    create.userHelper.createSiteAdmin(em, adminGroup)
    create.userHelper.createSiteAdmin(em, adminGroup)

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.ADMINISTRATOR
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = user.dxuser

    const res = await administratorProcess().build(input)
    expect(res).eq(1)
    expect(createOrgStub.calledOnce).to.be.true()
    expect(inviteUserToOrgStub.callCount).to.eq(3)
  })

  it('create administrator space as regular user - should fail', async () => {
    user = create.userHelper.create(em)
    create.userHelper.createSiteAdmin(em)
    const adminGroup = await em.findOne(AdminGroup, { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN })
    create.userHelper.createSiteAdmin(em, adminGroup)

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.ADMINISTRATOR
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = user.dxuser

    try {
      await administratorProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only admins can create Administrator space')
    }
  })

  it('create administrator space for another user - should fail', async () => {
    user = create.userHelper.createSiteAdmin(em)
    const differentUser = create.userHelper.create(em)
    const adminGroup = await em.findOne(AdminGroup, { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN })
    create.userHelper.createSiteAdmin(em, adminGroup)
    create.userHelper.createSiteAdmin(em, adminGroup)

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.ADMINISTRATOR
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = differentUser.dxuser

    try {
      await administratorProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('You are not allowed to create new Administrator Space for another user!')
    }
  })

  it('create government space', async () => {
    user = create.userHelper.createGov(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GOVERNMENT
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = user.dxuser

    const res = await governmentProcess().build(input)
    expect(res).eq(1)
    expect(createOrgStub.calledOnce).to.be.true()
  })

  it('create government space for another user - should fail', async () => {
    user = create.userHelper.createGov(em)
    const differentUser = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GOVERNMENT
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = differentUser.dxuser

    try {
      await governmentProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('You are not allowed to create new Government Space for another user!')
    }
  })

  it('create government space as regular user - should fail', async () => {
    user = create.userHelper.create(em)
    await em.flush()

    const input = new CreateSpaceDto()
    input.spaceType = SPACE_TYPE.GOVERNMENT
    input.name = 'test'
    input.description = 'test'
    input.hostLeadDxuser = user.dxuser

    try {
      await governmentProcess().build(input)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only government users can create Government space!')
    }
  })



  function groupsProcess() {
    userCtx = { dxuser: user.dxuser, id: user.id, accessToken: 'secret-token' }
    return new GroupsSpaceCreationProcess(userCtx, em, spaceNotificationService, adminPlatformClient)
  }

  function privateProcess() {
    userCtx = { dxuser: user.dxuser, id: user.id, accessToken: 'secret-token' }
    return new PrivateSpaceCreationProcess(userCtx, em, spaceNotificationService, platformClient, adminPlatformClient)
  }

  function administratorProcess() {
    userCtx = { dxuser: user.dxuser, id: user.id, accessToken: 'secret-token' }
    return new AdministratorSpaceCreationProcess(userCtx, em, spaceNotificationService, platformClient, adminPlatformClient)
  }

  function governmentProcess() {
    userCtx = { dxuser: user.dxuser, id: user.id, accessToken: 'secret-token' }
    return new GovernmentSpaceCreationProcess(userCtx, em, spaceNotificationService, platformClient, adminPlatformClient)
  }

})
