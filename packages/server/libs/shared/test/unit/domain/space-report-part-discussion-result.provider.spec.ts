import { Collection } from '@mikro-orm/core'
import { Answer } from '@shared/domain/answer/answer.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { SpaceReportPartDiscussionResultProviderService } from '@shared/facade/space-report/service/space-report-part-discussion-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartDiscussionResultProviderService', () => {
  const ID = 1

  const NOTE_ID = 10
  const NOTE_TITLE = 'NOTE_TITLE'
  const NOTE_CONTENT = 'NOTE_CONTENT'
  const NOTE = { id: NOTE_ID, title: NOTE_TITLE, content: NOTE_CONTENT }

  const USER_FULL_NAME = 'USER_FULL_NAME'
  const USER_DXUSER = 'USER_DXUSER'
  const USER = { fullName: USER_FULL_NAME, dxuser: USER_DXUSER }

  const CREATED_AT = 'CREATED_AT'

  const COMMENT_1_BODY = 'COMMENT_1_BODY'
  const COMMENT_1_CREATED_AT = 'COMMENT_1_CREATED_AT'
  const COMMENT_1_USER_FULL_NAME = 'COMMENT_1_USER_FULL_NAME'
  const COMMENT_1_USER_DXUSER = 'COMMENT_1_USER_DXUSER'
  const COMMENT_1_USER = { fullName: COMMENT_1_USER_FULL_NAME, dxuser: COMMENT_1_USER_DXUSER }
  const COMMENT_1 = { body: COMMENT_1_BODY, createdAt: COMMENT_1_CREATED_AT, user: COMMENT_1_USER }

  const COMMENT_2_BODY = 'COMMENT_2_BODY'
  const COMMENT_2_CREATED_AT = 'COMMENT_2_CREATED_AT'
  const COMMENT_2_USER_FULL_NAME = 'COMMENT_2_USER_FULL_NAME'
  const COMMENT_2_USER_DXUSER = 'COMMENT_2_USER_DXUSER'
  const COMMENT_2_USER = { fullName: COMMENT_2_USER_FULL_NAME, dxuser: COMMENT_2_USER_DXUSER }
  const COMMENT_2 = { body: COMMENT_2_BODY, createdAt: COMMENT_2_CREATED_AT, user: COMMENT_2_USER }

  const COMMENTS = [COMMENT_1, COMMENT_2]

  const ANSWER_NOTE_ID = 11
  const ANSWER_NOTE_CONTENT = 'ANSWER_NOTE_CONTENT'
  const ANSWER_NOTE = { id: ANSWER_NOTE_ID, content: ANSWER_NOTE_CONTENT }
  const ANSWER_USER_FULL_NAME = 'ANSWER_USER_FULL_NAME'
  const ANSWER_USER_DXUSER = 'ANSWER_USER_DXUSER'
  const ANSWER_USER = { fullName: ANSWER_USER_FULL_NAME, dxuser: ANSWER_USER_DXUSER }
  const ANSWER_CREATED_AT = 'ANSWER_CREATED_AT'
  const ANSWER_COMMENT_BODY = 'ANSWER_COMMENT_BODY'
  const ANSWER_COMMENT_CREATED_AT = 'ANSWER_COMMENT_CREATED_AT'
  const ANSWER_COMMENT_USER_FULL_NAME = 'ANSWER_COMMENT_USER_FULL_NAME'
  const ANSWER_COMMENT_USER_DXUSER = 'ANSWER_COMMENT_USER_DXUSER'
  const ANSWER_COMMENT_USER = {
    fullName: ANSWER_COMMENT_USER_FULL_NAME,
    dxuser: ANSWER_COMMENT_USER_DXUSER,
  }
  const ANSWER_COMMENT = {
    body: ANSWER_COMMENT_BODY,
    createdAt: ANSWER_COMMENT_CREATED_AT,
    user: ANSWER_COMMENT_USER,
  }
  const ANSWER = {
    note: ANSWER_NOTE,
    user: ANSWER_USER,
    createdAt: ANSWER_CREATED_AT,
    comments: [ANSWER_COMMENT],
  }

  const ATTACHMENT_1_NAME = 'ATTACHMENT_1_NAME'
  const ATTACHMENT_1_LINK = 'ATTACHMENT_1_LINK'
  const ATTACHMENT_1_TYPE = 'App'
  const ATTACHMENT_1 = { name: ATTACHMENT_1_NAME, link: ATTACHMENT_1_LINK, type: ATTACHMENT_1_TYPE }

  const ATTACHMENT_2_NAME = 'ATTACHMENT_2_NAME'
  const ATTACHMENT_2_LINK = 'ATTACHMENT_2_LINK'
  const ATTACHMENT_2_TYPE = 'UserFile'
  const ATTACHMENT_2 = { name: ATTACHMENT_2_NAME, link: ATTACHMENT_2_LINK, type: ATTACHMENT_2_TYPE }

  const ATTACHMENT_3_NAME = 'ATTACHMENT_3_NAME'
  const ATTACHMENT_3_LINK = 'ATTACHMENT_3_LINK'
  const ATTACHMENT_3_TYPE = 'Asset'
  const ATTACHMENT_3 = { name: ATTACHMENT_3_NAME, link: ATTACHMENT_3_LINK, type: ATTACHMENT_3_TYPE }

  const ATTACHMENT_4_NAME = 'ATTACHMENT_4_NAME'
  const ATTACHMENT_4_LINK = 'ATTACHMENT_4_LINK'
  const ATTACHMENT_4_TYPE = 'Job'
  const ATTACHMENT_4 = { name: ATTACHMENT_4_NAME, link: ATTACHMENT_4_LINK, type: ATTACHMENT_4_TYPE }

  const ATTACHMENT_5_NAME = 'ATTACHMENT_5_NAME'
  const ATTACHMENT_5_LINK = 'ATTACHMENT_5_LINK'
  const ATTACHMENT_5_TYPE = 'Comparison'
  const ATTACHMENT_5 = { name: ATTACHMENT_5_NAME, link: ATTACHMENT_5_LINK, type: ATTACHMENT_5_TYPE }

  const DISCUSSION_ENTITY = { id: ID, note: NOTE } as unknown as Discussion

  let DISCUSSION: Discussion

  const getDiscussionStub = stub()
  const getAttachmentsStub = stub()

  beforeEach(() => {
    DISCUSSION = {
      note: NOTE,
      user: USER,
      createdAt: CREATED_AT,
      comments: COMMENTS,
      answers: [ANSWER],
    } as unknown as Discussion

    getDiscussionStub.reset()
    getDiscussionStub.throws()
    getDiscussionStub.withArgs(ID).resolves(DISCUSSION)

    getAttachmentsStub.reset()
    getAttachmentsStub.throws()
    getAttachmentsStub
      .withArgs(NOTE_ID)
      .resolves([ATTACHMENT_1])
      .withArgs(ANSWER_NOTE_ID)
      .resolves([ATTACHMENT_2, ATTACHMENT_3, ATTACHMENT_4, ATTACHMENT_5])
  })

  describe('getHTMLResult', () => {
    testResults('HTML')
  })

  describe('getJSONResult', () => {
    testResults('JSON')
  })

  function testResults(format) {
    it('should provide correct result', async () => {
      const res = await getInstance().getResult(DISCUSSION_ENTITY, null, format)

      expect(res).to.deep.equal({
        title: NOTE_TITLE,
        content: NOTE_CONTENT,
        createdBy: USER,
        createdAt: CREATED_AT,
        answers: [
          {
            content: ANSWER_NOTE_CONTENT,
            createdBy: ANSWER_USER,
            createdAt: ANSWER_CREATED_AT,
            comments: [
              {
                content: ANSWER_COMMENT_BODY,
                createdAt: ANSWER_COMMENT_CREATED_AT,
                createdBy: ANSWER_COMMENT_USER,
              },
            ],
            attachments: [
              {
                name: ATTACHMENT_2_NAME,
                link: ATTACHMENT_2_LINK,
                type: 'file',
              },
              {
                name: ATTACHMENT_3_NAME,
                link: ATTACHMENT_3_LINK,
                type: 'asset',
              },
              {
                name: ATTACHMENT_4_NAME,
                link: ATTACHMENT_4_LINK,
                type: 'job',
              },
              {
                name: ATTACHMENT_5_NAME,
                link: ATTACHMENT_5_LINK,
                type: 'comparison',
              },
            ],
          },
        ],
        comments: [
          {
            content: COMMENT_1_BODY,
            createdAt: COMMENT_1_CREATED_AT,
            createdBy: COMMENT_1_USER,
          },
          {
            content: COMMENT_2_BODY,
            createdAt: COMMENT_2_CREATED_AT,
            createdBy: COMMENT_2_USER,
          },
        ],
        attachments: [
          {
            name: ATTACHMENT_1_NAME,
            link: ATTACHMENT_1_LINK,
            type: 'app',
          },
        ],
      })
    })

    it('should work with no comments', async () => {
      DISCUSSION.comments = new Collection<DiscussionComment>([])

      const res = await getInstance().getResult(DISCUSSION_ENTITY, null, format)

      expect(res).to.deep.equal({
        title: NOTE_TITLE,
        content: NOTE_CONTENT,
        createdBy: USER,
        createdAt: CREATED_AT,
        answers: [
          {
            content: ANSWER_NOTE_CONTENT,
            createdBy: ANSWER_USER,
            createdAt: ANSWER_CREATED_AT,
            comments: [
              {
                content: ANSWER_COMMENT_BODY,
                createdAt: ANSWER_COMMENT_CREATED_AT,
                createdBy: ANSWER_COMMENT_USER,
              },
            ],
            attachments: [
              {
                name: ATTACHMENT_2_NAME,
                link: ATTACHMENT_2_LINK,
                type: 'file',
              },
              {
                name: ATTACHMENT_3_NAME,
                link: ATTACHMENT_3_LINK,
                type: 'asset',
              },
              {
                name: ATTACHMENT_4_NAME,
                link: ATTACHMENT_4_LINK,
                type: 'job',
              },
              {
                name: ATTACHMENT_5_NAME,
                link: ATTACHMENT_5_LINK,
                type: 'comparison',
              },
            ],
          },
        ],
        comments: [],
        attachments: [
          {
            name: ATTACHMENT_1_NAME,
            link: ATTACHMENT_1_LINK,
            type: 'app',
          },
        ],
      })
    })

    it('should work with no answers', async () => {
      DISCUSSION.answers = new Collection<Answer>([])

      const res = await getInstance().getResult(DISCUSSION_ENTITY, null, format)

      expect(res).to.deep.equal({
        title: NOTE_TITLE,
        content: NOTE_CONTENT,
        createdBy: USER,
        createdAt: CREATED_AT,
        answers: [],
        comments: [
          {
            content: COMMENT_1_BODY,
            createdAt: COMMENT_1_CREATED_AT,
            createdBy: COMMENT_1_USER,
          },
          {
            content: COMMENT_2_BODY,
            createdAt: COMMENT_2_CREATED_AT,
            createdBy: COMMENT_2_USER,
          },
        ],
        attachments: [
          {
            name: ATTACHMENT_1_NAME,
            link: ATTACHMENT_1_LINK,
            type: 'app',
          },
        ],
      })
    })

    it('should work with no attachments', async () => {
      getAttachmentsStub.reset()
      getAttachmentsStub.resolves([])

      const res = await getInstance().getResult(DISCUSSION_ENTITY, null, format)

      expect(res).to.deep.equal({
        title: NOTE_TITLE,
        content: NOTE_CONTENT,
        createdBy: USER,
        createdAt: CREATED_AT,
        answers: [
          {
            content: ANSWER_NOTE_CONTENT,
            createdBy: ANSWER_USER,
            createdAt: ANSWER_CREATED_AT,
            comments: [
              {
                content: ANSWER_COMMENT_BODY,
                createdAt: ANSWER_COMMENT_CREATED_AT,
                createdBy: ANSWER_COMMENT_USER,
              },
            ],
            attachments: [],
          },
        ],
        comments: [
          {
            content: COMMENT_1_BODY,
            createdAt: COMMENT_1_CREATED_AT,
            createdBy: COMMENT_1_USER,
          },
          {
            content: COMMENT_2_BODY,
            createdAt: COMMENT_2_CREATED_AT,
            createdBy: COMMENT_2_USER,
          },
        ],
        attachments: [],
      })
    })

    it('should not catch error from getDiscussion', async () => {
      const error = new Error('my error')
      getDiscussionStub.reset()
      getDiscussionStub.throws(error)

      await expect(getInstance().getResult(DISCUSSION_ENTITY, null, format)).to.be.rejectedWith(
        error,
      )
    })

    it('should not catch error from getAttachments', async () => {
      const error = new Error('my error')
      getAttachmentsStub.reset()
      getAttachmentsStub.throws(error)

      await expect(getInstance().getResult(DISCUSSION_ENTITY, null, format)).to.be.rejectedWith(
        error,
      )
    })
  }

  function getInstance() {
    const discussionService = {
      getDiscussion: getDiscussionStub,
      getAttachments: getAttachmentsStub,
    } as unknown as DiscussionService

    return new SpaceReportPartDiscussionResultProviderService(discussionService)
  }
})
