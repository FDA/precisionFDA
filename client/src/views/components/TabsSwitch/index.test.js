import React from 'react'
import { shallow } from 'enzyme'

import TabsSwitch from './index'


describe('TabsSwitch', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<TabsSwitch />)

    expect(wrapper).toMatchSnapshot()
  })
})
