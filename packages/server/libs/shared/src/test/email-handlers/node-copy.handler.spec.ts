import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EmailClient } from '@shared/services/email-client'
import { UserRepository } from '@shared/domain/user/user.repository'
import { Organization } from '@shared/domain/org/org.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'

describe('NodeCopyHandler', () => {
  const USER_ID = 11

  const emailClientSendEmailStub = stub()
  const userRepoFindStub = stub()

  const userRepo = {
    find: userRepoFindStub,
  } as unknown as UserRepository
  const userEmail = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new NodeCopyHandler(userRepo, userEmail)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    userRepoFindStub.reset()
    userRepoFindStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.email = 'test@email.com'

      const input = new NodeCopyInputDTO()
      input.destination = 'test-destination'
      input.notCopiedFileNames = ['file1', 'file2']
      input.notCopiedFolderNames = ['folder1', 'folder2']
      input.receiverUserIds = [USER_ID]

      userRepoFindStub.withArgs({ id: { $in: input.receiverUserIds } }).resolves([user])
      emailClientSendEmailStub.reset()

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.nodeCopy)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        "Some items haven't been copied to test-destination",
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        "Some items haven't been copied to test-destination",
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `The following folders haven't been copied since they already exist in ${input.destination}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${input.notCopiedFolderNames.join(', ')}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `The following files haven't been copied since they already exist in ${input.destination}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${input.notCopiedFileNames.join(', ')}`,
      )
    })
  })
})
