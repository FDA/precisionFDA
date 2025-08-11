import { config } from '@shared/config'
import { ExpertEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-entity-link.provider'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { expect } from 'chai'

describe('ExpertEntityLinkProvider', () => {
  const EXPERT_ID = 1
  const EXPERT = { id: EXPERT_ID } as unknown as Expert

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(EXPERT)

    expect(res).to.equal(`${config.api.railsHost}/experts/${EXPERT_ID}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(EXPERT, { absolute: false })

    expect(res).to.equal(`/experts/${EXPERT_ID}`)
  })

  function getInstance(): ExpertEntityLinkProvider {
    return new ExpertEntityLinkProvider()
  }
})
