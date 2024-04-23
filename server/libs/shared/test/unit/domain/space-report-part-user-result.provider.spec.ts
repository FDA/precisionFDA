import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { SpaceReportPartUserResultProvider } from '@shared/facade/space-report/service/space-report-part-user-result-provider.service'
import { expect } from 'chai'

describe('SpaceReportPartUserResultProvider', () => {
  const USER_ID = 0

  const MEMBERSHIP_ROLE = 0
  const MEMBERSHIP_SIDE = 0
  const MEMBERSHIP_CREATED = 'MEMBERSHIP_CREATED'
  const MEMBERSHIP = {
    role: MEMBERSHIP_ROLE,
    createdAt: MEMBERSHIP_CREATED,
    user: { id: USER_ID },
    active: true,
    side: MEMBERSHIP_SIDE,
  }

  const FULL_NAME = 'FULL_NAME'
  const DXUSER = 'DXUSER'

  const USER = {
    id: USER_ID,
    fullName: FULL_NAME,
    dxuser: DXUSER,
  } as unknown as User

  const SPACE = {
    spaceMemberships: [MEMBERSHIP],
    type: SPACE_TYPE.REVIEW,
  } as unknown as Space

  it('should provide correct HTML result', async () => {
    const res = await getInstance().getResult(USER, SPACE, 'HTML')

    expect(res).to.deep.equal({
      role: MEMBERSHIP_ROLE,
      side: MEMBERSHIP_SIDE,
      title: FULL_NAME,
      memberSince: MEMBERSHIP_CREATED,
      dxuser: DXUSER,
      link: 'https://rails-host:1234/users/DXUSER',
    })
  })

  it('should provide correct JSON result', async () => {
    const res = await getInstance().getResult(USER, SPACE, 'JSON')

    expect(res).to.deep.equal({
      role: 'Admin',
      side: 'Reviewer',
      title: FULL_NAME,
      memberSince: MEMBERSHIP_CREATED,
      dxuser: DXUSER,
      link: 'https://rails-host:1234/users/DXUSER',
    })
  })

  function getInstance() {
    return new SpaceReportPartUserResultProvider()
  }
})
