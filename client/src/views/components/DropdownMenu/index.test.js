import React from 'react'
import { shallow } from 'enzyme'

import DropdownMenu from './index'


describe('DropdownMenu', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<DropdownMenu />)

    expect(wrapper).toMatchSnapshot()
  })
})
