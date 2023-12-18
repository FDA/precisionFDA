import { expect } from 'chai'
import { App } from '../../../src/domain'
import {
  SpaceReportPartAppResultMetaProvider,
} from '../../../src/domain/space-report/service/part/space-report-part-app-result-meta.provider'

describe('SpaceReportPartAppResultMetaProvider', () => {
  const TITLE = 'title'
  const REVISION = 'revision'
  const CREATED = 'created'

  const APP = {
    title: TITLE,
    revision: REVISION,
    createdAt: CREATED,
  } as unknown as App

  it('should provide correct meta', () => {
    const res = getInstance().getResultMeta(APP)

    expect(res).to.deep.equal({ title: `${TITLE} (revision ${REVISION})`, created: CREATED })
  })

  it('should provide app title as title if no revision', () => {
    const res = getInstance().getResultMeta({ ...APP, revision: null })

    expect(res.title).to.eq(TITLE)
  })

  function getInstance() {
    return new SpaceReportPartAppResultMetaProvider()
  }
})
