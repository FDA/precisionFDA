import React from 'react'
import { shallow } from 'enzyme'

import ChallengesYearList from './index'


describe('ChallengesYearList', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<ChallengesYearList setYearHandler={() => {}} />)

    expect(wrapper).toMatchSnapshot()
  })
})