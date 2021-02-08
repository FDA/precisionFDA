import React from 'react'
import { shallow } from 'enzyme'

import RevisionDropdown from './index'


describe('RevisionDropdown', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<RevisionDropdown />)

    expect(wrapper).toMatchSnapshot()
  })
})
