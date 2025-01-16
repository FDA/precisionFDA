import { EntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { database } from '@shared/database'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserSpaceInconsistencyFixService } from '@shared/facade/user/service/user-space-inconsistency-fix.service'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { InconsistentFix } from '@shared/facade/user/user-facade.types'
import { PlatformClient } from '@shared/platform-client'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('UserDataConsistencyReportFacade', () => {
  let em: EntityManager
  let user: User

  const userDescribeStub = stub()
  const orgFindMembersStub = stub()
  const projectDescribeStub = stub()
  const correctSpaceBillToStub = stub().named('correctSpaceBillTo')
  const inviteAdminUserToOrgStub = stub().named('inviteAdminUserToOrg')

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em, { dxuser: 'test.test' })
    await em.flush()

    userDescribeStub.resolves({
      email: user.email,
    })
    orgFindMembersStub.reset()
    orgFindMembersStub.resolves({
      results: [
        {
          id: 'user-precisionfda.admin_dev',
          level: 'ADMIN',
          allowBillableActivities: true,
          cloudIntegrationManagement: false,
          projectAccess: 'ADMINISTER',
          appAccess: true,
        },
      ],
    })
    projectDescribeStub.reset()
    projectDescribeStub.resolves({
      billTo: user.billTo(),
    })
    correctSpaceBillToStub.reset()
    inviteAdminUserToOrgStub.reset()
  })

  it("should not count error if user's billable org contains admin user", async () => {
    const { output } = await getInstance().createReport()
    expect(output.billableOrgErrorsCount).to.be.equal(0)
  })

  it("should count error if user's billable org does not contain admin user", async () => {
    orgFindMembersStub.reset()
    orgFindMembersStub.resolves({
      results: [],
    })

    const { output, inconsistentFixes } = await getInstance().createReport()
    expect(output.billableOrgErrorsCount).to.be.equal(1)
    expect(output.billableOrg.errors[0]).to.be.equal('Admin user not found in billable org')
    expect(inconsistentFixes.length).to.be.equal(1)
    expect(inconsistentFixes[0][0]).to.be.equal('inviteAdminUserToOrg')
  })

  it('should count error if user has incorrect billTo in project', async () => {
    const space = create.spacesHelper.create(em, { type: SPACE_TYPE.GROUPS })
    const hostLead = create.userHelper.create(em)
    const oldGuestLead = create.userHelper.create(em)
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user: oldGuestLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    create.spacesHelper.addMember(
      em,
      { user, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    await em.flush()
    projectDescribeStub.reset()
    projectDescribeStub.resolves({
      billTo: oldGuestLead.billTo(),
    })

    const { output, inconsistentFixes } = await getInstance().createReport()
    expect(output.spacesWithErrorsCount).to.be.equal(1)
    expect(output.spaces[0].spaceId).to.be.equal(space.id)
    expect(inconsistentFixes.length).to.be.equal(1)
    expect(inconsistentFixes[0][0]).to.be.equal('correctSpaceBillTo')
  })

  it("should count error if space's org does not contains admin user", async () => {
    const space = create.spacesHelper.create(em, { type: SPACE_TYPE.GROUPS })
    const hostLead = create.userHelper.create(em)
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    await em.flush()
    orgFindMembersStub
      .withArgs({
        orgDxid: space.guestDxOrg,
        id: [`user-${config.platform.adminUser}`],
        level: 'ADMIN',
      })
      .resolves({
        results: [],
      })

    const { output, inconsistentFixes } = await getInstance().createReport()
    expect(output.spacesWithErrorsCount).to.be.equal(1)
    expect(output.spaces[0].spaceId).to.be.equal(space.id)
    expect(inconsistentFixes.length).to.be.equal(1)
    expect(inconsistentFixes[0][0]).to.be.equal('inviteAdminUserToOrg')
  })

  it('should run fixing if there are inconsistent data', async () => {
    const inconsistentFixes = [
      ['correctSpaceBillTo', [user.billTo(), 'project-dxid1']],
      ['correctSpaceBillTo', [user.billTo(), 'project-dxid2']],
      ['inviteAdminUserToOrg', ['org-dxid']],
    ] as InconsistentFix[]
    await getInstance().fixInconsistentData(inconsistentFixes)
    expect(correctSpaceBillToStub.calledTwice).to.be.true
    expect(inviteAdminUserToOrgStub.calledOnce).to.be.true
  })

  function getInstance() {
    const userContext = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
    }
    const spaceMembershipRepository = em.getRepository(SpaceMembership)
    const emailsJobProducer = {} as unknown as EmailQueueJobProducer
    const platformClient = {
      userDescribe: userDescribeStub,
      orgFindMembers: orgFindMembersStub,
      projectDescribe: projectDescribeStub,
    } as unknown as PlatformClient
    const userSpaceInconsistencyFixService = {
      correctSpaceBillTo: correctSpaceBillToStub,
      inviteAdminUserToOrg: inviteAdminUserToOrgStub,
    } as unknown as UserSpaceInconsistencyFixService
    return new UserDataConsistencyReportFacade(
      em,
      userContext,
      spaceMembershipRepository,
      emailsJobProducer,
      platformClient,
      userSpaceInconsistencyFixService,
    )
  }
})
