import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportResultHtmlProvider } from '@shared/domain/space-report/service/result/space-report-result-html.provider'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'
import { Space } from '@shared/domain/space/space.entity'
import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { stub } from 'sinon'

describe('SpaceReportResultHtmlProvider', () => {
  const REPORT_ID = 0
  const REPORT_CREATED = new Date('2023-09-01T14:58:08.000Z')

  const SPACE_ID = 100
  const SPACE_NAME = 'space name'
  const SPACE_DESCRIPTION = 'space description'
  const SPACE = {
    id: SPACE_ID,
    name: SPACE_NAME,
    description: SPACE_DESCRIPTION,
    isConfidentialReviewerSpace: () => false,
    isConfidentialSponsorSpace: () => false,
  } as unknown as Space

  const REPORT_SCOPE = `space-${SPACE_ID}`

  const REPORT_PART_1_ID = 10
  const REPORT_PART_1_TITLE = 'title 1'
  const REPORT_PART_1_RESULT = { title: REPORT_PART_1_TITLE }
  const REPORT_PART_1_SOURCE_TYPE = 'file'
  const REPORT_PART_1 = {
    id: REPORT_PART_1_ID,
    result: REPORT_PART_1_RESULT,
    sourceType: REPORT_PART_1_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_2_ID = 20
  const REPORT_PART_2_TITLE = 'title 2'
  const REPORT_PART_2_RESULT = { title: REPORT_PART_2_TITLE }
  const REPORT_PART_2_SOURCE_TYPE = 'file'
  const REPORT_PART_2 = {
    id: REPORT_PART_2_ID,
    result: REPORT_PART_2_RESULT,
    sourceType: REPORT_PART_2_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_3_ID = 30
  const REPORT_PART_3_TITLE = 'title 2'
  const REPORT_PART_3_RESULT = { title: REPORT_PART_3_TITLE }
  const REPORT_PART_3_SOURCE_TYPE = 'app'
  const REPORT_PART_3 = {
    id: REPORT_PART_3_ID,
    result: REPORT_PART_3_RESULT,
    sourceType: REPORT_PART_3_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PARTS = [REPORT_PART_1, REPORT_PART_2, REPORT_PART_3]
  const getPartsStub = stub()

  const REPORT_CREATED_BY_FULLNAME = 'REPORT_CREATED_BY_FULLNAME'
  const REPORT_CREATED_BY = {
    fullName: REPORT_CREATED_BY_FULLNAME,
  }

  const REPORT = {
    id: REPORT_ID,
    reportParts: { getItems: getPartsStub },
    scope: REPORT_SCOPE,
    createdAt: REPORT_CREATED,
    createdBy: { getEntity: () => REPORT_CREATED_BY },
  } as unknown as SpaceReport<'HTML'>

  const fileContentProvideStub = stub()
  const appContentProvideStub = stub()
  const jobContentProvideStub = stub()
  const assetContentProvideStub = stub()
  const workflowContentProvideStub = stub()
  const userContentProvideStub = stub()
  const findOneOrFailStub = stub()

  beforeEach(() => {
    getPartsStub.reset()
    getPartsStub.returns(REPORT_PARTS)

    fileContentProvideStub.reset()
    fileContentProvideStub.throws()
    fileContentProvideStub
      .withArgs(REPORT_PART_1, 'report-part-10')
      .returns(getContentFake('report-part-10', REPORT_PART_1_TITLE))
    fileContentProvideStub
      .withArgs(REPORT_PART_2, 'report-part-20')
      .returns(getContentFake('report-part-20', REPORT_PART_2_TITLE))

    appContentProvideStub.reset()
    appContentProvideStub.throws()
    appContentProvideStub
      .withArgs(REPORT_PART_3, 'report-part-30')
      .returns(getContentFake('report-part-30', REPORT_PART_3_TITLE))

    jobContentProvideStub.reset()
    jobContentProvideStub.throws()

    assetContentProvideStub.reset()
    assetContentProvideStub.throws()

    workflowContentProvideStub.reset()
    workflowContentProvideStub.throws()

    userContentProvideStub.reset()
    userContentProvideStub.throws()

    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(Space, SPACE_ID).resolves(SPACE)
  })

  it('should create a valid HTML', async () => {
    const res = await getResultDocument()

    expect(res).to.not.be.null()
  })

  it('should contain the space name', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(SPACE_NAME)
  })

  it('should contain the space description', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(SPACE_DESCRIPTION)
  })

  it('should contain the space created time', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_CREATED.toLocaleString())
  })

  it('should contain the report part 1 title', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_1_TITLE)
  })

  it('should contain the report part 2 title', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_TITLE)
  })

  it('should contain the report part 3 title', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_3_TITLE)
  })

  it('should not contain empty text for files', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).not.to.include('There are no files in this space')
  })

  it('should not contain empty text for apps', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).not.to.include('There are no apps in this space')
  })

  it('should contain empty text for jobs', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include('There are no executions in this space')
  })

  it('should contain empty text for assets', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include('There are no assets in this space')
  })

  it('should contain empty text for workflows', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include('There are no workflows in this space')
  })

  it('should contain empty text for users', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include('There are no members in this space')
  })

  it('should contain 10 links', async () => {
    const res = await getResultDocument()
    const links = res.getElementsByTagName('a')

    expect(links).to.have.length(10)
  })

  it('should contain links pointing to the correct elements', async () => {
    const res = await getResultDocument()
    const links = res.getElementsByTagName('a')

    Array.from(links).forEach((link) => {
      const href = link.getAttribute('href')
      expect(href).not.to.be.null()

      const targetId = href.substring(1)
      const targetElement = res.getElementById(targetId)
      expect(targetElement).not.to.be.null()

      expect(link.textContent).to.eq(targetElement.textContent)
    })
  })

  it('should contain styles, if provided', async () => {
    const STYLES = 'some styles'

    const res = await getResultDocument(STYLES)
    const styles = res.getElementsByTagName('style')
    const providedStyles = Array.from(styles).find((s) => s.textContent === STYLES)

    expect(providedStyles).not.to.be.null()
  })

  it('should not catch error from content provider', async () => {
    const error = new Error('my error')

    getPartsStub.returns([REPORT_PART_1])

    fileContentProvideStub.reset()
    fileContentProvideStub.throws(error)

    await expect(getInstance().provide(REPORT, { styles: '' })).to.be.rejectedWith(error)
  })
  ;[
    { type: 'app', contentStub: appContentProvideStub },
    { type: 'asset', contentStub: assetContentProvideStub },
    { type: 'file', contentStub: fileContentProvideStub },
    { type: 'job', contentStub: jobContentProvideStub },
    { type: 'workflow', contentStub: workflowContentProvideStub },
    { type: 'user', contentStub: userContentProvideStub },
  ].forEach((prop) => {
    it(`should use the correct result content provider and repo for source type ${prop.type}`, async () => {
      const TITLE = 'TITLE'
      const REPORT_PART_WITH_TYPE = { id: 5, sourceType: prop.type, result: { title: TITLE } }
      const TITLE_ID = 'report-part-5'

      getPartsStub.returns([REPORT_PART_WITH_TYPE])

      prop.contentStub.reset()
      prop.contentStub.throws()
      prop.contentStub
        .withArgs(REPORT_PART_WITH_TYPE, TITLE_ID)
        .returns(getContentFake(TITLE_ID, TITLE))

      const res = await getResultDocument()
      const titleElem = res.getElementById(TITLE_ID)

      expect(titleElem).to.exist()
      expect(titleElem.textContent).to.eq(TITLE)
    })
  })

  async function getResultDocument(styles?: string) {
    return new JSDOM(await getInstance().provide(REPORT, { styles })).window.document
  }

  function getInstance() {
    const ENTITY_PARENT_RESOLVER_MAP = {
      app: {
        provide: appContentProvideStub,
      },
      asset: {
        provide: assetContentProvideStub,
      },
      file: {
        provide: fileContentProvideStub,
      },
      job: {
        provide: jobContentProvideStub,
      },
      user: {
        provide: userContentProvideStub,
      },
      workflow: {
        provide: workflowContentProvideStub,
      },
    } as unknown as {
      [T in SpaceReportPartSourceType]: SpaceReportResultPartHtmlContentProvider<T>
    }

    const em = {
      findOneOrFail: findOneOrFailStub,
    } as unknown as SqlEntityManager

    return new SpaceReportResultHtmlProvider(ENTITY_PARENT_RESOLVER_MAP, em)
  }

  function getContentFake(id: string, title: string) {
    return new JSDOM(`<div><h3 id="${id}">${title}</h3></div>`).window.document.querySelector('div')
  }
})
