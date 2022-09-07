import React from 'react'
import { shallow } from 'enzyme'

import { ChallengeDetailsPage } from '.'


describe('ChallengeDetailsPage test', () => {
  it('should render', () => {
    const wrapper = shallow(<ChallengeDetailsPage loadChallenge={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })
})
