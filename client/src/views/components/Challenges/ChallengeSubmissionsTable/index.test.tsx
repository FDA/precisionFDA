import React from 'react'
import { shallow } from 'enzyme'

import { ChallengeSubmissionsTable } from '.'


describe('ChallengeSubmissionsTable test', () => {
  it('should render', () => {
    const props = {
      challengeId: 1,
      submissions: [],
      isFetching: false,
      user: null,
      fetchData: (challengeId: number) => {},
    }
    const wrapper = shallow(<ChallengeSubmissionsTable {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
