import React from 'react'
import { shallow } from 'enzyme'

import HomeLabel from './index'


describe('HomeLabel', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeLabel />)

    expect(wrapper).toMatchSnapshot()
  })
})
