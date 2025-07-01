import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionEntityLinkProvider } from '@shared/domain/entity/entity-link/discussion-entity-link.provider'
import { expect } from 'chai'
import { config } from '@shared/config'

describe('DiscussionEntityLinkProvider', () => {
  const ID = 0

  const SPACE_ID = 10
  const NOTE_SCOPE = `space-${SPACE_ID}`
  const NOTE = { scope: NOTE_SCOPE, getSpaceId: () => SPACE_ID }

  const DISCUSSION = {
    id: ID,
    note: { load: () => Promise.resolve(NOTE) },
  } as unknown as Discussion

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(DISCUSSION)

    expect(res).to.equal(`${config.api.railsHost}/spaces/${SPACE_ID}/discussions/${ID}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(DISCUSSION, { absolute: false })

    expect(res).to.equal(`/spaces/${SPACE_ID}/discussions/${ID}`)
  })

  function getInstance() {
    return new DiscussionEntityLinkProvider()
  }
})
