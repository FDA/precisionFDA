import { EntityManager } from '@mikro-orm/mysql'
import { ORG_EVERYONE } from '@shared/config/consts'
import { database } from '@shared/database'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { PROVISIONING_STATE } from '@shared/domain/invitation/invitation.enum'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Organization } from '@shared/domain/org/org.entity'
import { OrgRepository } from '@shared/domain/org/org.repository'
import { constructDxOrg, getBaseHandle, getHandle } from '@shared/domain/org/org.utils'
import { Profile } from '@shared/domain/profile/profile.entity'
import { ProfileRepository } from '@shared/domain/profile/profile.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { constructOrgFromUsername, constructUsername } from '@shared/domain/user/user.helper'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { UserProvisionFacade } from '@shared/facade/user/user-provision.facade'
import { PlatformClient } from '@shared/platform-client'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EmailService } from '@shared/domain/email/email.service'

describe('UserProvisionFacade', () => {
  let em: EntityManager
  let siteAdmin: User
  let userRepo: UserRepository
  let orgRepo: OrgRepository
  let invitationRepo: InvitationRepository
  let profileRepo: ProfileRepository
  let emailService: EmailService
  let siteAdminContext: UserContext
  const userDescribeStub = stub()
  const orgDescribeStub = stub()
  const updateBillingInformationStub = stub()
  const createUserStub = stub()
  const createOrgStub = stub()
  const inviteUserToOrgStub = stub()
  const createNotificationStub = stub()
  const emailServiceSendEmailStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()

    userRepo = new UserRepository(em, User)
    orgRepo = new OrgRepository(em, Organization)
    invitationRepo = new InvitationRepository(em, Invitation)
    profileRepo = new ProfileRepository(em, Profile)
    siteAdmin = create.userHelper.createAdmin(em)
    await em.flush()
    siteAdminContext = {
      id: siteAdmin.id,
      dxuser: siteAdmin.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: (): Promise<User> => Promise.resolve(siteAdmin),
    }
    emailService = {
      sendEmail: emailServiceSendEmailStub,
    } as unknown as EmailService

    userDescribeStub.reset()
    orgDescribeStub.reset()

    updateBillingInformationStub.reset()
    updateBillingInformationStub.resolves({
      message: 'Billing information has been forcibly set.',
      status: 'BillingInfoForceSet',
    })

    createOrgStub.reset()

    createUserStub.reset()
    createUserStub.resolves({})

    inviteUserToOrgStub.reset()
    createNotificationStub.reset()

    emailServiceSendEmailStub.reset()
    emailServiceSendEmailStub.throws()
  })

  // after(() => {
  //   em.clear()
  //   return db.dropData(database.connection())
  // })

  it('should provide a new user from a valid invitation', async () => {
    const invitation = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation.firstName, invitation.lastName)
    const proposedOrg = constructOrgFromUsername(username)
    const orgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const orgHandle = getHandle(orgDxid)
    userDescribeStub.withArgs({ dxid: `user-${username}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: orgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(orgHandle, proposedOrg.orgName).resolves({
      id: orgDxid,
    })

    await getInstance().provision(invitation.id, [invitation.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation.id })
    expect(createUserStub.calledOnce).to.be.true()
    expect(createUserStub.firstCall.args[0]).to.deep.eq({
      username,
      email: invitation.email,
      first: invitation.firstName,
      last: invitation.lastName,
      billTo: ORG_EVERYONE,
    })
    const user = await userRepo.findOne({ id: updatedInvitation.user.id })
    expect(user.dxuser).to.equal(username)
    const org = await orgRepo.findOne({ id: user.organization.id })
    expect(org.handle).to.equal(username.replace(/\./g, ''))
    const profile = await profileRepo.findOne({ user: user.id })
    expect(profile.email).to.equal(invitation.email)
    expect(createNotificationStub.calledTwice).to.be.true()
    expect(createNotificationStub.firstCall.args[0]).to.deep.eq({
      message: 'A provisioning task has been done',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
    })
    expect(createNotificationStub.secondCall.args[0]).to.deep.eq({
      message: 'Completed provisioning for 1 user, 0 task failed',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.ALL_USER_PROVISIONINGS_COMPLETED,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
      meta: {
        linkTitle: 'View Results',
        linkUrl: '/admin/invitations/provisioning?invitations=1',
        linkTarget: '_blank',
      },
    })
  })

  it('should update username and provision user if username already exists', async () => {
    const invitation = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation.firstName, invitation.lastName)
    const expectedUsername = `${username}.3`
    const proposedOrg = constructOrgFromUsername(expectedUsername)
    const expectedOrgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const orgHandle = getHandle(expectedOrgDxid)

    userDescribeStub.withArgs({ dxid: `user-${username}` }).resolves({
      id: `user-${username}`,
    })
    userDescribeStub.withArgs({ dxid: `user-${username}.2` }).resolves({
      id: `user-${username}.2`,
    })
    userDescribeStub.withArgs({ dxid: `user-${expectedUsername}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: expectedOrgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(orgHandle, proposedOrg.orgName).resolves({
      id: expectedOrgDxid,
    })

    await getInstance().provision(invitation.id, [invitation.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation.id })
    const user = await userRepo.findOne({ id: updatedInvitation.user.id })
    expect(user.dxuser).to.equal(`${username}.3`)
    const org = await orgRepo.findOne({ id: user.organization.id })
    expect(org.handle).to.equal(getBaseHandle(expectedOrgDxid))
    expect(createUserStub.calledOnce).to.be.true()
    expect(createUserStub.firstCall.args[0]).to.deep.eq({
      username: expectedUsername,
      email: invitation.email,
      first: invitation.firstName,
      last: invitation.lastName,
      billTo: ORG_EVERYONE,
    })
  })

  it('should update org name and provision user if org name already exists', async () => {
    const invitation = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation.firstName, invitation.lastName)
    const expectedUsername = `${username}.2`
    const proposedOrg = constructOrgFromUsername(expectedUsername)
    const proposedOrgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const expectedOrgDxid = constructDxOrg(`${proposedOrg.orgBaseHandle}.2`)
    const expectedOrgHandle = getHandle(expectedOrgDxid)

    userDescribeStub.withArgs({ dxid: `user-${username}` }).resolves({
      id: `user-${username}`,
    })
    userDescribeStub.withArgs({ dxid: `user-${expectedUsername}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: proposedOrgDxid }).resolves({
      id: proposedOrgDxid,
    })
    orgDescribeStub.withArgs({ dxid: expectedOrgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(expectedOrgHandle, proposedOrg.orgName).resolves({
      id: expectedOrgDxid,
    })

    await getInstance().provision(invitation.id, [invitation.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation.id })
    const user = await userRepo.findOne({ id: updatedInvitation.user.id })
    expect(user.dxuser).to.equal(expectedUsername)
    const org = await orgRepo.findOne({ id: user.organization.id })
    expect(org.handle).to.equal(getBaseHandle(expectedOrgDxid))
    expect(createUserStub.calledOnce).to.be.true()
    expect(createUserStub.firstCall.args[0]).to.deep.eq({
      username: expectedUsername,
      email: invitation.email,
      first: invitation.firstName,
      last: invitation.lastName,
      billTo: ORG_EVERYONE,
    })
  })

  it('should add sso field if email is gov email', async () => {
    emailServiceSendEmailStub.reset()
    const invitation = create.inivitationHelper.create(em, {
      email: 'testuser@fda.hhs.gov',
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation.firstName, invitation.lastName)
    const proposedOrg = constructOrgFromUsername(username)
    const orgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const orgHandle = getHandle(orgDxid)
    userDescribeStub.withArgs({ dxid: `user-${username}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: orgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(orgHandle, proposedOrg.orgName).resolves({
      id: orgDxid,
    })

    await getInstance().provision(invitation.id, [invitation.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation.id })
    expect(createUserStub.calledOnce).to.be.true()
    expect(createUserStub.firstCall.args[0]).to.deep.eq({
      username,
      email: invitation.email,
      first: invitation.firstName,
      last: invitation.lastName,
      billTo: ORG_EVERYONE,
      pfdasso: true,
    })
    const user = await userRepo.findOne({ id: updatedInvitation.user.id })
    expect(user.dxuser).to.equal(username)
    const org = await orgRepo.findOne({ id: user.organization.id })
    expect(org.handle).to.equal(username.replace(/\./g, ''))
    const profile = await profileRepo.findOne({ user: user.id })
    expect(profile.email).to.equal(invitation.email)
    expect(emailServiceSendEmailStub.calledOnce).to.be.true()
    expect(emailServiceSendEmailStub.firstCall.args[0].input.firstName).to.eq(invitation.firstName)
    expect(emailServiceSendEmailStub.firstCall.args[0].input.email).to.eq(invitation.email)
    expect(emailServiceSendEmailStub.firstCall.args[0].input.username).to.eq(username)

    expect(createNotificationStub.calledTwice).to.be.true()
    expect(createNotificationStub.firstCall.args[0]).to.deep.eq({
      message: 'A provisioning task has been done',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
    })
    expect(createNotificationStub.secondCall.args[0]).to.deep.eq({
      message: 'Completed provisioning for 1 user, 0 task failed',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.ALL_USER_PROVISIONINGS_COMPLETED,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
      meta: {
        linkTitle: 'View Results',
        linkUrl: '/admin/invitations/provisioning?invitations=1',
        linkTarget: '_blank',
      },
    })
  })

  it('should run into catch block and update invitation when unexpected error occurs', async () => {
    const invitation = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation.firstName, invitation.lastName)
    const proposedOrg = constructOrgFromUsername(username)
    const orgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const orgHandle = getHandle(orgDxid)
    userDescribeStub.withArgs({ dxid: `user-${username}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: orgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(orgHandle, proposedOrg.orgName).throws({
      props: { clientStatusCode: 400 },
    })

    await getInstance().provision(invitation.id, [invitation.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation.id })
    expect(updatedInvitation.provisioningState).to.equal(PROVISIONING_STATE.FAILED)
    expect(createNotificationStub.firstCall.args[0]).to.deep.eq({
      message: `Provisioning failed for the email: ${invitation.email}`,
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
    })
  })

  it('should create USER_PROVISIONING_DONE notification if a provisioning success', async () => {
    const invitation1 = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    const invitation2 = create.inivitationHelper.create(em, {
      provisioningState: PROVISIONING_STATE.IN_PROGRESS,
    })
    await em.flush()

    const username = constructUsername(invitation1.firstName, invitation1.lastName)
    const proposedOrg = constructOrgFromUsername(username)
    const orgDxid = constructDxOrg(proposedOrg.orgBaseHandle)
    const orgHandle = getHandle(orgDxid)
    userDescribeStub.withArgs({ dxid: `user-${username}` }).throws({
      props: { clientStatusCode: 404 },
    })
    orgDescribeStub.withArgs({ dxid: orgDxid }).throws({
      props: { clientStatusCode: 404 },
    })
    createOrgStub.withArgs(orgHandle, proposedOrg.orgName).resolves({
      id: orgDxid,
    })

    await getInstance().provision(invitation1.id, [invitation1.id, invitation2.id])
    const updatedInvitation = await invitationRepo.findOne({ id: invitation1.id })
    expect(createUserStub.calledOnce).to.be.true()
    expect(createUserStub.firstCall.args[0]).to.deep.eq({
      username,
      email: invitation1.email,
      first: invitation1.firstName,
      last: invitation1.lastName,
      billTo: ORG_EVERYONE,
    })
    const user = await userRepo.findOne({ id: updatedInvitation.user.id })
    expect(user.dxuser).to.equal(username)
    const org = await orgRepo.findOne({ id: user.organization.id })
    expect(org.handle).to.equal(username.replace(/\./g, ''))
    const profile = await profileRepo.findOne({ user: user.id })
    expect(profile.email).to.equal(invitation1.email)
    expect(createNotificationStub.calledOnce).to.be.true()
    expect(createNotificationStub.firstCall.args[0]).to.deep.eq({
      message: 'A provisioning task has been done',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
      userId: siteAdmin.id,
      sessionId: 'sessionId',
    })
  })

  function getInstance(): UserProvisionFacade {
    const platformClient = {
      userDescribe: userDescribeStub,
      orgDescribe: orgDescribeStub,
    } as unknown as PlatformClient
    const adminClient = {
      createOrg: createOrgStub,
      createUser: createUserStub,
      inviteUserToOrganization: inviteUserToOrgStub,
      updateBillingInformation: updateBillingInformationStub,
    } as unknown as PlatformClient
    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService
    return new UserProvisionFacade(
      em,
      siteAdminContext,
      platformClient,
      adminClient,
      userRepo,
      orgRepo,
      invitationRepo,
      emailService,
      notificationService,
    )
  }
})
