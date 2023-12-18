import { expect } from 'chai'
import { UserFile } from '../../../src/domain'
import {
  SpaceReportPartFileResultMetaProvider,
} from '../../../src/domain/space-report/service/part/space-report-part-file-result-meta.provider'

describe('SpaceReportPartFileResultMetaProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const FILE = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as UserFile

  it('should provide correct meta', () => {
    const res = getInstance().getResultMeta(FILE)

    expect(res).to.deep.equal({ title: NAME, created: CREATED })
  })

  function getInstance() {
    return new SpaceReportPartFileResultMetaProvider()
  }
})
