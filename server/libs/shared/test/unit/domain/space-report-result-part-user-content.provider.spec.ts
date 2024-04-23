import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReportResultPartUserHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-html-content.provider'
import { expect } from 'chai'

describe('SpaceReportResultPartUserContentProvider', () => {
  const TITLE = 'title'
  const MEMBER_SINCE = new Date('2023-09-01T14:58:08.000Z')
  const ROLE = SPACE_MEMBERSHIP_ROLE.LEAD
  const DXUSER = 'DXUSER'
  const LINK = 'link'
  const RESULT = { memberSince: MEMBER_SINCE, role: ROLE, title: TITLE, dxuser: DXUSER, link: LINK }

  const REPORT_PART = { result: RESULT } as SpaceReportPart<'user'>

  const TITLE_ID = 'TITLE_ID'

  it('should add title', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(TITLE)
  })

  it('should include element with the provided ID', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.querySelector(`#${TITLE_ID}`)).to.exist()
  })

  it('should add member since', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include(MEMBER_SINCE.toLocaleString())
  })

  it('should add role', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    expect(res.textContent).to.include('Lead')
  })

  it('should add link to dxuser', async () => {
    const res = await getInstance().provide(REPORT_PART, TITLE_ID)

    const link = res.querySelector(`[href="${LINK}"]`)
    expect(link).to.exist()
    expect(link.textContent).to.eq(DXUSER)
  })

  function getInstance() {
    return new SpaceReportResultPartUserHtmlContentProvider()
  }
})
