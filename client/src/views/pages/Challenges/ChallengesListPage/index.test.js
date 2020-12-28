import React from 'react'
import { shallow } from 'enzyme'

import { ChallengesListPage } from '.'
import ChallengesList from '../../../components/Challenges/ChallengesList'


describe('ChallengesListPage test', () => {
  it('should render', () => {
    const wrapper = shallow(<ChallengesListPage />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain ChallengesList', () => {
    const wrapper = shallow(<ChallengesListPage />)
    // console.log(wrapper.debug());
    expect(wrapper.find(ChallengesList)).toHaveLength(1)
  })
})
