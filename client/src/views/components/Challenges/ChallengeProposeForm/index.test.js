import React from 'react'
import { shallow } from 'enzyme'

import { ChallengeProposeForm } from '.'


describe('ChallengeProposeForm', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<ChallengeProposeForm />)

    expect(wrapper).toMatchSnapshot()
  })
})