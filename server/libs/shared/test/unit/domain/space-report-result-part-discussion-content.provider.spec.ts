import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReportResultPartDiscussionHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-discussion-html-content.provider'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportResultPartDiscussionHtmlContentProvider', () => {
  const TITLE_ID = 'TITLE_ID'

  const TITLE = 'TITLE'
  const CONTENT = 'CONTENT'
  const CREATED_BY = 'CREATED_BY'
  const CREATED_AT = new Date('2023-09-01T14:58:08.000Z')

  const ENTITY_1_ICON = 'ENTITY_1_ICON'
  const ENTITY_2_ICON = 'ENTITY_2_ICON'
  const ENTITY_3_ICON = 'ENTITY_3_ICON'

  const ATTACHMENT_1_NAME = 'ATTACHMENT_1_NAME'
  const ATTACHMENT_1_LINK = 'ATTACHMENT_1_LINK'
  const ATTACHMENT_1_TYPE = 'ATTACHMENT_1_TYPE'
  const ATTACHMENT_1 = {
    name: ATTACHMENT_1_NAME,
    link: ATTACHMENT_1_LINK,
    type: ATTACHMENT_1_TYPE,
  }

  const ATTACHMENT_2_NAME = 'ATTACHMENT_2_NAME'
  const ATTACHMENT_2_LINK = 'ATTACHMENT_2_LINK'
  const ATTACHMENT_2_TYPE = 'ATTACHMENT_2_TYPE'
  const ATTACHMENT_2 = {
    name: ATTACHMENT_2_NAME,
    link: ATTACHMENT_2_LINK,
    type: ATTACHMENT_2_TYPE,
  }

  const ANSWER_CONTENT = 'ANSWER_CONTENT'
  const ANSWER_CREATED_BY = 'ANSWER_CREATED_BY'
  const ANSWER_CREATED_AT = new Date('2023-09-02T14:58:08.000Z')

  const ANSWER_COMMENT_CONTENT = 'ANSWER_COMMENT_CONTENT'
  const ANSWER_COMMENT_CREATED_BY = 'ANSWER_COMMENT_CREATED_BY'
  const ANSWER_COMMENT_CREATED_AT = new Date('2023-09-03T14:58:08.000Z')
  const ANSWER_COMMENT = {
    content: ANSWER_COMMENT_CONTENT,
    createdBy: { fullName: ANSWER_COMMENT_CREATED_BY },
    createdAt: ANSWER_COMMENT_CREATED_AT,
  }
  const ANSWER_ATTACHMENT_NAME = 'ANSWER_ATTACHMENT_NAME'
  const ANSWER_ATTACHMENT_LINK = 'ANSWER_ATTACHMENT_LINK'
  const ANSWER_ATTACHMENT_TYPE = 'ANSWER_ATTACHMENT_TYPE'
  const ANSWER_ATTACHMENT = {
    name: ANSWER_ATTACHMENT_NAME,
    link: ANSWER_ATTACHMENT_LINK,
    type: ANSWER_ATTACHMENT_TYPE,
  }

  const ANSWER = {
    content: ANSWER_CONTENT,
    createdBy: { fullName: ANSWER_CREATED_BY },
    createdAt: ANSWER_CREATED_AT,
    comments: [ANSWER_COMMENT],
    attachments: [ANSWER_ATTACHMENT],
  }

  const COMMENT_1_CONTENT = 'COMMENT_1_CONTENT'
  const COMMENT_1_CREATED_BY = 'COMMENT_1_CREATED_BY'
  const COMMENT_1_CREATED_AT = new Date('2023-09-04T14:58:08.000Z')
  const COMMENT_1 = {
    content: COMMENT_1_CONTENT,
    createdBy: { fullName: COMMENT_1_CREATED_BY },
    createdAt: COMMENT_1_CREATED_AT,
  }

  const COMMENT_2_CONTENT = 'COMMENT_2_CONTENT'
  const COMMENT_2_CREATED_BY = 'COMMENT_2_CREATED_BY'
  const COMMENT_2_CREATED_AT = new Date('2023-09-05T14:58:08.000Z')
  const COMMENT_2 = {
    content: COMMENT_2_CONTENT,
    createdBy: { fullName: COMMENT_2_CREATED_BY },
    createdAt: COMMENT_2_CREATED_AT,
  }

  const RESULT = {
    title: TITLE,
    content: CONTENT,
    createdBy: { fullName: CREATED_BY },
    createdAt: CREATED_AT,
    answers: [ANSWER],
    comments: [COMMENT_1, COMMENT_2],
    attachments: [ATTACHMENT_1, ATTACHMENT_2],
  }

  const REPORT_PART = { result: RESULT } as unknown as SpaceReportPart<'discussion', 'HTML'>

  const getEntityIconStub = stub()

  beforeEach(() => {
    getEntityIconStub.reset()
    getEntityIconStub.throws()
    getEntityIconStub
      .withArgs(ATTACHMENT_1_TYPE)
      .resolves(ENTITY_1_ICON)
      .withArgs(ATTACHMENT_2_TYPE)
      .resolves(ENTITY_2_ICON)
      .withArgs(ANSWER_ATTACHMENT_TYPE)
      .resolves(ENTITY_3_ICON)
  })

  it('should include title', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(TITLE)
  })

  it('should include element with the provided ID', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.querySelector(`#${TITLE_ID}`)).to.exist()
  })

  it('should include conversation starter text', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(
      `${CREATED_BY} started the discussion on ${CREATED_AT.toLocaleString()}`,
    )
  })

  it('should include content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(CONTENT)
  })

  it('should include first attachment link', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    const link = res.querySelector(`[href="${ATTACHMENT_1_LINK}"]`)
    expect(link).to.exist()
    expect(link.textContent).to.eq(ENTITY_1_ICON + ATTACHMENT_1_NAME)
  })

  it('should include second attachment link', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    const link = res.querySelector(`[href="${ATTACHMENT_1_LINK}"]`)
    expect(link).to.exist()
    expect(link.textContent).to.eq(ENTITY_1_ICON + ATTACHMENT_1_NAME)
  })

  it('should include answered text', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)
    const a = `${ANSWER_CREATED_BY} started the discussion on ${ANSWER_CREATED_AT.toLocaleString()}`
    expect(res.textContent).to.include(
      `${ANSWER_CREATED_BY} answered on ${ANSWER_CREATED_AT.toLocaleString()}`,
    )
  })

  it('should include answer content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(ANSWER_CONTENT)
  })

  it('should include answer comment content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(ANSWER_COMMENT_CONTENT)
  })

  it('should include answer attachment link', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    const link = res.querySelector(`[href="${ANSWER_ATTACHMENT_LINK}"]`)
    expect(link).to.exist()
    expect(link.textContent).to.eq(ENTITY_3_ICON + ANSWER_ATTACHMENT_NAME)
  })

  it('should include comment content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(COMMENT_1_CONTENT)
    expect(res.textContent).to.include(COMMENT_2_CONTENT)
  })

  it('should include first commented text', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(
      `${COMMENT_1_CREATED_BY} commented on ${COMMENT_1_CREATED_AT.toLocaleString()}`,
    )
  })

  it('should include first comment content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(COMMENT_1_CONTENT)
  })

  it('should include second commented text', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(
      `${COMMENT_2_CREATED_BY} commented on ${COMMENT_2_CREATED_AT.toLocaleString()}`,
    )
  })

  it('should include second comment content', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(COMMENT_2_CONTENT)
  })

  function getInstance() {
    const entityService = { getEntityIcon: getEntityIconStub } as unknown as EntityService

    return new SpaceReportResultPartDiscussionHtmlContentProvider(entityService)
  }
})
