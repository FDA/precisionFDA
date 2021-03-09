import React from 'react'
import { shallow } from 'enzyme'

import HomeLicense from './index'


describe('HomeLicense', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeLicense />)

    expect(wrapper).toMatchSnapshot()
  })
})
