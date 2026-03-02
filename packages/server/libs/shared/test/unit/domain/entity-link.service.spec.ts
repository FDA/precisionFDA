import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { Answer } from '@shared/domain/answer/answer.entity'
import { App } from '@shared/domain/app/app.entity'
import { DiscussionReplyComment } from '@shared/domain/discussion-reply/discussion-reply-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { UiLinkableEntityType } from '@shared/domain/entity/entity-link/domain/ui-linkable-entity.type'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { PlatformClient } from '@shared/platform-client'
import { EntityUtils } from '@shared/utils/entity.utils'

describe('EntityLinkService', () => {
  const appGetLinkStub = stub()
  const answerGetLinkStub = stub()
  const userGetLinkStub = stub()
  const fileDownloadLinkStub = stub()
  const commentGetLinkStub = stub()
  const discussionGetLinkStub = stub()

  beforeEach(() => {
    appGetLinkStub.reset()
    appGetLinkStub.throws()

    answerGetLinkStub.reset()
    answerGetLinkStub.throws()

    userGetLinkStub.reset()
    userGetLinkStub.throws()

    fileDownloadLinkStub.reset()
    fileDownloadLinkStub.throws()

    commentGetLinkStub.reset()
    commentGetLinkStub.throws()

    discussionGetLinkStub.reset()
    discussionGetLinkStub.throws()
  })

  describe('#getUiLink', () => {
    const APP_ID = 0
    const APP = { id: APP_ID } as unknown as App
    const APP_LINK = 'APP_LINK'

    const USER_ID = 10
    const USER = { id: USER_ID } as unknown as User
    const USER_LINK = 'USER_LINK'

    const ANSWER_ID = 20
    const ANSWER = { id: ANSWER_ID } as unknown as Answer
    const ANSWER_LINK = 'ANSWER_LINK'

    const ANSWER_COMMENT_ID = 30
    const ANSWER_COMMENT = { id: ANSWER_COMMENT_ID } as unknown as DiscussionReplyComment
    const ANSWER_COMMENT_LINK = 'ANSWER_COMMENT_LINK'

    const DISCUSSION_COMMENT_ID = 40
    const DISCUSSION_COMMENT = { id: DISCUSSION_COMMENT_ID } as unknown as DiscussionReplyComment
    const DISCUSSION_COMMENT_LINK = 'DISCUSSION_COMMENT_LINK'

    const DISCUSSION_ID = 50
    const DISCUSSION = { id: DISCUSSION_ID } as unknown as Discussion
    const DISCUSSION_LINK = 'DISCUSSION_LINK'

    let getEntityTypeForEntityStub

    beforeEach(() => {
      appGetLinkStub.withArgs(APP).resolves(APP_LINK)
      answerGetLinkStub.withArgs(ANSWER).resolves(ANSWER_LINK)
      userGetLinkStub.withArgs(USER).resolves(USER_LINK)
      commentGetLinkStub.withArgs(DISCUSSION_COMMENT).resolves(DISCUSSION_COMMENT_LINK)
      commentGetLinkStub.withArgs(ANSWER_COMMENT).resolves(ANSWER_COMMENT_LINK)
      discussionGetLinkStub.withArgs(DISCUSSION).resolves(DISCUSSION_LINK)

      getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
      getEntityTypeForEntityStub.withArgs(APP).returns('app')
      getEntityTypeForEntityStub.withArgs(ANSWER).returns('answer')
      getEntityTypeForEntityStub.withArgs(USER).returns('user')
      getEntityTypeForEntityStub.withArgs(DISCUSSION_COMMENT).returns('comment')
      getEntityTypeForEntityStub.withArgs(ANSWER_COMMENT).returns('comment')
      getEntityTypeForEntityStub.withArgs(DISCUSSION).returns('discussion')
    })

    afterEach(() => {
      getEntityTypeForEntityStub.restore()
    })

    it('should return correct link for an app', async () => {
      const res = await getInstance().getUiLink(APP)

      expect(res).to.equal(APP_LINK)
    })

    it('should return correct link for a user', async () => {
      const res = await getInstance().getUiLink(USER)

      expect(res).to.equal(USER_LINK)
    })

    it('should return correct link for an answer', async () => {
      const res = await getInstance().getUiLink(ANSWER)

      expect(res).to.equal(ANSWER_LINK)
    })

    it('should return correct link for a comment', async () => {
      const res1 = await getInstance().getUiLink(ANSWER_COMMENT)

      expect(res1).to.equal(ANSWER_COMMENT_LINK)

      const res2 = await getInstance().getUiLink(DISCUSSION_COMMENT)
      expect(res2).to.equal(DISCUSSION_COMMENT_LINK)
    })

    it('should return correct link for a discussion', async () => {
      const res = await getInstance().getUiLink(DISCUSSION)

      expect(res).to.equal(DISCUSSION_LINK)
    })

    it('should throw an error for unsupported entity', async () => {
      getEntityTypeForEntityStub.withArgs(USER).returns('some entity')

      await expect(getInstance().getUiLink(USER)).to.be.rejectedWith(
        Error,
        `No link provider found for entity type "some entity"`,
      )
    })
  })

  describe('#getDownloadLink', () => {
    const FILE_UID = 'FILE_UID'
    const FILE_DXID = 'FILE_DXID'
    const FILE_PROJECT = 'FILE_PROJECT'
    const FILE = { uid: FILE_UID, dxid: FILE_DXID, project: FILE_PROJECT } as unknown as UserFile
    const NAME = 'NAME'

    it('should create PFDA link by default', async () => {
      const res = await getInstance().getDownloadLink(FILE, NAME)

      expect(res).to.equal(`${config.api.railsHost}/api/files/FILE_UID/NAME`)
    })

    it('should correctly encode the file name into the url', async () => {
      const res = await getInstance().getDownloadLink(FILE, "Crazy&File *Name #123?='Yes'.jpg")

      expect(res).to.equal(`${config.api.railsHost}/api/files/FILE_UID/Crazy%26File%20_Name%20%23123_%3D'Yes'.jpg`)
    })

    it('should include the inline parameter when inline is set to true', async () => {
      const res = await getInstance().getDownloadLink(FILE, NAME, { inline: true })

      expect(res).to.equal(`${config.api.railsHost}/api/files/FILE_UID/NAME?inline=true`)
    })

    it('should get platform link for preauthenticated links', async () => {
      const DURATION = 10
      const PREAUTHENTICATED = true
      const LINK = 'https://platform-link.com/'

      fileDownloadLinkStub
        .withArgs({
          fileDxid: FILE_DXID,
          filename: NAME,
          project: FILE_PROJECT,
          duration: DURATION,
          preauthenticated: PREAUTHENTICATED,
        })
        .resolves({ url: LINK })

      const res = await getInstance().getDownloadLink(FILE, NAME, {
        preauthenticated: PREAUTHENTICATED,
        duration: DURATION,
      })

      expect(res).to.equal(LINK)
    })

    it('should set duration to 24 hours by default for preauthenticated links', async () => {
      const PREAUTHENTICATED = true
      const LINK = 'https://platform-link.com/'

      fileDownloadLinkStub
        .withArgs({
          fileDxid: FILE_DXID,
          filename: NAME,
          project: FILE_PROJECT,
          duration: 86400,
          preauthenticated: PREAUTHENTICATED,
        })
        .resolves({ url: LINK })

      const res = await getInstance().getDownloadLink(FILE, NAME, {
        preauthenticated: PREAUTHENTICATED,
      })

      expect(res).to.equal(LINK)
    })
  })

  function getInstance(): EntityLinkService {
    const linkProviderMap = {
      app: { getLink: appGetLinkStub },
      user: { getLink: userGetLinkStub },
      answer: { getLink: answerGetLinkStub },
      comment: { getLink: commentGetLinkStub },
      discussion: { getLink: discussionGetLinkStub },
    } as unknown as {
      [T in UiLinkableEntityType]: EntityLinkProvider<T>
    }

    const platformClient = {
      fileDownloadLink: fileDownloadLinkStub,
    } as unknown as PlatformClient

    return new EntityLinkService(linkProviderMap, platformClient)
  }
})
