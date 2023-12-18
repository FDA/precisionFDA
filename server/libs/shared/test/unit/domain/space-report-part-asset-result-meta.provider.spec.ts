import { expect } from 'chai'
import { Asset } from '../../../src/domain'
import {
  SpaceReportPartAssetResultMetaProvider,
} from '../../../src/domain/space-report/service/part/space-report-part-asset-result-meta.provider'

describe('SpaceReportPartAssetResultMetaProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const ASSET = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Asset

  it('should provide correct meta', () => {
    const res = getInstance().getResultMeta(ASSET)

    expect(res).to.deep.equal({ title: NAME, created: CREATED })
  })

  function getInstance() {
    return new SpaceReportPartAssetResultMetaProvider()
  }
})
