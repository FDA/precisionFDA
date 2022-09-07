import React from 'react'
import { shallow } from 'enzyme'

import { ChallengesBanner } from '.'


describe('ChallengesBanner', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<ChallengesBanner />)
    expect(wrapper).toMatchSnapshot()
  })
})
