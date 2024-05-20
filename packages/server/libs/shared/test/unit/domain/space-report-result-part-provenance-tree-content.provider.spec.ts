import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReportResultPartProvenanceTreeHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-html-content.provider'
import { expect } from 'chai'

describe('SpaceReportResultPartProvenanceTreeContentProvider', () => {
  const CREATED = new Date('2023-09-01T14:58:08.000Z')
  const SVG = 'svg'
  const TITLE = 'title'
  const RESULT = { created: CREATED, svg: SVG, title: TITLE }

  const REPORT_PART = { result: RESULT } as SpaceReportPart<'app'>

  const TITLE_ID = 'TITLE_ID'

  it('should add title', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(TITLE)
  })

  it('should include element with the provided ID', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.querySelector(`#${TITLE_ID}`)).to.exist()
  })

  it('should add created date', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(CREATED.toLocaleString())
  })

  it('should add svg', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(SVG)
  })

  function getInstance() {
    return new SpaceReportResultPartProvenanceTreeHtmlContentProvider()
  }
})
