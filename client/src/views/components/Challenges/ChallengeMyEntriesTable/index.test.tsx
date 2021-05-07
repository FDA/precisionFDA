import React from 'react'
import { shallow } from 'enzyme'

import { ChallengeMyEntriesTable } from '.'


describe('ChallengeMyEntriesTable test', () => {
  it('should render', () => {
    const props = {
      challengeId: 1,
      submissions: [],
      isFetching: false,
      user: null,
      fetchData: (challengeId: number) => {},
    }
    const wrapper = shallow(<ChallengeMyEntriesTable {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
