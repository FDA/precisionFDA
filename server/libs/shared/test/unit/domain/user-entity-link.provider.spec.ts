import { UserEntityLinkProvider } from '@shared/domain/entity/entity-link/user-entity-link.provider'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'

describe('UserEntityLinkProvider', () => {
  const DX_USER = 'DX_USER'
  const USER = { dxuser: DX_USER } as unknown as User

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(USER)

    expect(res).to.equal(`https://rails-host:1234/users/${DX_USER}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(USER, { absolute: false })

    expect(res).to.equal(`/users/${DX_USER}`)
  })

  function getInstance() {
    return new UserEntityLinkProvider()
  }
})
