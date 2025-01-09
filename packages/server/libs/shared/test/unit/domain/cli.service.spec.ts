import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User } from '@shared/domain/user/user.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { database } from '@shared/database'
import { create, generate } from '@shared/test'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { SinonStub, stub } from 'sinon'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { CliEditDiscussionDTO } from '@shared/domain/cli/dto/cli-edit-discussion.dto'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'

describe('CliService tests', () => {
  let user: User
  let em: EntityManager<MySqlDriver>

  let createDiscussionStub: SinonStub
  let updateDiscussionStub: SinonStub
  let createAnswerStub: SinonStub
  let createCommentStub: SinonStub
  let getUiLinkStub: SinonStub
  let getAttachmentsStub: SinonStub

  beforeEach(async () => {
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    await em.flush()

    createDiscussionStub = stub().throws()
    updateDiscussionStub = stub().throws()
    createAnswerStub = stub().throws()
    createCommentStub = stub().throws()
    getUiLinkStub = stub().throws()
    getAttachmentsStub = stub().throws()
  })

  it('should be defined', () => {
    const cliService = getInstance()
    expect(cliService).to.be.not.undefined
  })

  context('managing discussions', () => {
    it('should call create discussion and return a link', async () => {
      createDiscussionStub.resolves({ id: 1 })
      getUiLinkStub.resolves('https://localhost:3000/surely-working-link-to-discussion')

      const discussionDTO: CliCreateDiscussionDTO = {
        title: 'CLI testing discussion',
        content: 'CLI testing discussion content #cli ##testing ###sendhelp',
        attachments: new CliAttachmentsDTO(),
      }
      const link = await getInstance().createDiscussion(1, discussionDTO)
      expect(link).to.be.equal('https://localhost:3000/surely-working-link-to-discussion')
      expect(createDiscussionStub.calledOnce).to.be.true()
      expect(getUiLinkStub.calledOnce).to.be.true()
    })

    it('should call create answer and return a link', async () => {
      createAnswerStub.resolves({ id: 1 })
      getUiLinkStub.resolves('https://localhost:3000/surely-working-link-to-discussion-answer')

      const replyDTO: CliCreateReplyDTO = {
        discussionId: 1,
        replyType: 'answer',
        content: 'CLI testing answer content #cli ##testing ###sendhelp',
        attachments: new CliAttachmentsDTO(),
      }

      const link = await getInstance().createReply(replyDTO)
      expect(link).to.be.equal('https://localhost:3000/surely-working-link-to-discussion-answer')
      expect(createAnswerStub.calledOnce).to.be.true()
      expect(getUiLinkStub.calledOnce).to.be.true()
    })

    it('should call create comment and return a link', async () => {
      createCommentStub.resolves({ id: 1 })
      getUiLinkStub.resolves('https://localhost:3000/surely-working-link-to-discussion-comment')

      const replyDTO: CliCreateReplyDTO = {
        answerId: 1,
        replyType: 'comment',
        content: 'CLI testing comment content #cli ##testing ###sendhelp',
        attachments: new CliAttachmentsDTO(),
      }

      const link = await getInstance().createReply(replyDTO)
      expect(link).to.be.equal('https://localhost:3000/surely-working-link-to-discussion-comment')
      expect(createCommentStub.calledOnce).to.be.true()
      expect(getUiLinkStub.calledOnce).to.be.true()
    })

    it('should append content to existing discussion', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em)
      const hostLead = create.userHelper.create(em)
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user: guestLead, space }, {})
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      getUiLinkStub.resolves('https://localhost:3000/surely-working-link-to-discussion')
      getAttachmentsStub.resolves([])
      updateDiscussionStub.resolves()

      const editDiscussionDTO: CliEditDiscussionDTO = {
        content: 'appendix 1',
        attachments: new CliAttachmentsDTO(),
      }
      const link = await getInstance().editDiscussion(discussion.id, editDiscussionDTO)
      expect(link).to.be.equal('https://localhost:3000/surely-working-link-to-discussion')
    })
  })

  function getInstance() {
    const accessToken = 'accessToken'
    const userCtx = new UserContext(user.id, accessToken, user.dxuser, null)

    const discussionService = {
      createDiscussion: createDiscussionStub,
      updateDiscussion: updateDiscussionStub,
      createAnswer: createAnswerStub,
      createComment: createCommentStub,
      getAttachments: getAttachmentsStub,
    } as unknown as DiscussionService

    const entityLinkService = {
      getUiLink: getUiLinkStub,
    } as unknown as EntityLinkService

    const fetcher = new EntityFetcherService(em, userCtx)
    const client = new PlatformClient({ accessToken })
    return new CliService(em, userCtx, fetcher, discussionService, client, entityLinkService)
  }
})
