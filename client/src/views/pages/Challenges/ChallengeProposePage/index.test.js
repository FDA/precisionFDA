import React from 'react'
import { shallow } from 'enzyme'

import { ChallengeProposePage } from '.'


describe('ChallengeProposePage test', () => {
  it('should render', () => {
    const wrapper = shallow(<ChallengeProposePage />)
    expect(wrapper).toMatchSnapshot()
  })
})
