import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { ComparisonEntityLinkProvider } from '@shared/domain/entity/entity-link/comparison-entity-link.provider'
import { expect } from 'chai'

describe('ComparisonEntityLinkProvider', () => {
  const ID = 0
  const COMPARISON = { id: ID } as unknown as Comparison

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(COMPARISON)

    expect(res).to.equal(`https://rails-host:1234/comparisons/${ID}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(COMPARISON, { absolute: false })

    expect(res).to.equal(`/comparisons/${ID}`)
  })

  function getInstance() {
    return new ComparisonEntityLinkProvider()
  }
})
