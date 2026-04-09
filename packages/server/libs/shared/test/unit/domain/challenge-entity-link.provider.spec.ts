import { expect } from 'chai'
import { config } from '@shared/config'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { ChallengeEntityLinkProvider } from '@shared/domain/entity/entity-link/challenge-entity-link.provider'

describe('ChallengeEntityLinkProvider', () => {
  const ID = 1
  const CHALLENGE = { id: ID } as unknown as Challenge

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(CHALLENGE)

    expect(res).to.equal(`${config.api.railsHost}/challenges/${ID}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(CHALLENGE, { absolute: false })

    expect(res).to.equal(`/challenges/${ID}`)
  })

  function getInstance(): ChallengeEntityLinkProvider {
    return new ChallengeEntityLinkProvider()
  }
})
