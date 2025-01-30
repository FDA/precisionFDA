import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'

describe('NodeCopyHandler', () => {
  let receiverUserIds: number[] = [1]
  const emFindStub = stub()

  const entityManager = {
    find: emFindStub,
  } as unknown as EntityManager
  const log = {
    log: stub(),
    error: stub(),
  } as unknown as Logger

  const userOpsCtx: UserOpsCtx = {
    em: entityManager,
    user: {
      id: 1,
      accessToken: 'accessToken',
      dxuser: 'dxuser',
    },
    log,
  }

  const nodeCopyInput = {
    destination: 'Project XYZ',
    notCopiedFolderNames: ['Folder A', 'Folder B'],
    notCopiedFileNames: ['File 1.txt', 'File 2.jpg'],
  }

  beforeEach(() => {
    emFindStub.reset()
    emFindStub.throws()
  })

  const getNodeCopyHandler = () => {
    return new NodeCopyHandler(EMAIL_TYPES.nodeCopy, nodeCopyInput, userOpsCtx, receiverUserIds)
  }

  it('getNotificationKey', () => {
    const nodeCopyHandler = getNodeCopyHandler()

    expect(nodeCopyHandler.getNotificationKey()).to.eq('node_copy')
  })

  it('determineReceivers', async () => {
    const nodeCopyHandler = getNodeCopyHandler()

    const user = {
      email: 'email',
    } as unknown as User
    emFindStub.withArgs(User, { id: { $in: receiverUserIds } }).resolves([user])

    const receivers = await nodeCopyHandler.determineReceivers()
    expect(receivers).to.deep.eq([user])
  })

  it('template', async () => {
    const nodeCopyHandler = getNodeCopyHandler()

    const receiver = {
      email: 'email',
    } as unknown as User

    const result = await nodeCopyHandler.template(receiver)

    expect(result.emailType).to.eq(EMAIL_TYPES.nodeCopy)
    expect(result.to).to.eq(receiver.email)
    expect(result.body).to.contain("Some items haven't been copied to Project XYZ")
    expect(result.body).to.contain('Folder A')
    expect(result.body).to.contain('Folder B')
    expect(result.body).to.contain('File 1.txt')
    expect(result.body).to.contain('File 2.jpg')
    expect(result.subject).to.eq("Some items haven't been copied to Project XYZ")
  })
})
