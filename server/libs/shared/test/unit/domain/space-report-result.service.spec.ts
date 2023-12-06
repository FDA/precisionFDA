import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { stub } from 'sinon'
import type { Space, SpaceReport, SpaceReportPart } from '../../../src/domain'
import { SpaceReportResultService } from '../../../src/domain/space-report/service/space-report-result.service'

describe('SpaceReportResultService', () => {
  const REPORT_ID = 0
  const REPORT_CREATED = new Date('2023-09-01T14:58:08.000Z')

  const SPACE_NAME = 'space name'
  const SPACE_DESCRIPTION = 'space description'
  const SPACE = { name: SPACE_NAME, description: SPACE_DESCRIPTION } as unknown as Space

  const REPORT_PART_1_ID = 10
  const REPORT_PART_1_TITLE = 'title 1'
  const REPORT_PART_1_CREATED = new Date('2023-10-11T14:58:08.000Z')
  const REPORT_PART_1_SVG = 'svg 1'
  const REPORT_PART_1_RESULT = { title: REPORT_PART_1_TITLE, created: REPORT_PART_1_CREATED, svg: REPORT_PART_1_SVG }
  const REPORT_PART_1_SOURCE_TYPE = 'file'
  const REPORT_PART_1 = {
    id: REPORT_PART_1_ID,
    result: REPORT_PART_1_RESULT,
    sourceType: REPORT_PART_1_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_2_ID = 20
  const REPORT_PART_2_TITLE = 'title 2'
  const REPORT_PART_2_CREATED = new Date('2023-10-12T14:58:08.000Z')
  const REPORT_PART_2_SVG = 'svg 2'
  const REPORT_PART_2_RESULT = { title: REPORT_PART_2_TITLE, created: REPORT_PART_2_CREATED, svg: REPORT_PART_2_SVG }
  const REPORT_PART_2_SOURCE_TYPE = 'file'
  const REPORT_PART_2 = {
    id: REPORT_PART_2_ID,
    result: REPORT_PART_2_RESULT,
    sourceType: REPORT_PART_2_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_3_ID = 30
  const REPORT_PART_3_TITLE = 'title 2'
  const REPORT_PART_3_CREATED = new Date('2023-10-12T14:58:08.000Z')
  const REPORT_PART_3_SVG = 'svg 2'
  const REPORT_PART_3_RESULT = { title: REPORT_PART_3_TITLE, created: REPORT_PART_3_CREATED, svg: REPORT_PART_3_SVG }
  const REPORT_PART_3_SOURCE_TYPE = 'app'
  const REPORT_PART_3 = {
    id: REPORT_PART_3_ID,
    result: REPORT_PART_3_RESULT,
    sourceType: REPORT_PART_3_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PARTS = [REPORT_PART_1, REPORT_PART_2, REPORT_PART_3]
  const getPartsStub = stub()

  const REPORT = {
    id: REPORT_ID,
    reportParts: { getItems: getPartsStub },
    space: SPACE,
    createdAt: REPORT_CREATED,
  } as unknown as SpaceReport

  beforeEach(() => {
    getPartsStub.reset()
    getPartsStub.returns(REPORT_PARTS)
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

  it('should contain the report part 1 svg', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_1_SVG)
  })

  it('should contain the report part 1 created', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_1_CREATED.toLocaleString())
  })

  it('should contain the report part 2 title', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_TITLE)
  })

  it('should contain the report part 2 svg', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_SVG)
  })

  it('should contain the report part 2 created', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_CREATED.toLocaleString())
  })

  it('should contain the report part 3 title', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_TITLE)
  })

  it('should contain the report part 3 svg', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_SVG)
  })

  it('should contain the report part 3 created', async () => {
    const res = await getResultDocument()

    expect(res.body.textContent).to.include(REPORT_PART_2_CREATED.toLocaleString())
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

  it('should contain 8 links', async () => {
    const res = await getResultDocument()
    const links = res.getElementsByTagName('a')

    expect(links).to.have.length(8)
  })

  it('should contain links pointing to the correct elements', async () => {
    const res = await getResultDocument()
    const links = res.getElementsByTagName('a')

    Array.from(links).forEach(link => {
      const href = link.getAttribute('href')
      expect(href).not.to.be.null()

      const targetId = href.substring(1)
      const targetElement = res.getElementById(targetId)
      expect(targetElement).not.to.be.null()

      expect(link.textContent).to.eq(targetElement.textContent)
    })
    expect(links).to.have.length(8)
  })

  it('should contain styles, if provided', async () => {
    const STYLES = 'some styles'

    const res = await getResultDocument(STYLES)
    const styles = res.getElementsByTagName('style')
    const providedStyles = Array.from(styles).find(s => s.textContent === STYLES)

    expect(providedStyles).not.to.be.null()
  })

  async function getResultDocument(styles?: string) {
    return new JSDOM(await getInstance().generateResult(REPORT, styles)).window.document
  }

  function getInstance() {
    return new SpaceReportResultService()
  }
})
