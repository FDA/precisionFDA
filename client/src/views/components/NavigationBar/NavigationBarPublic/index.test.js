import React from 'react'
import { shallow } from 'enzyme'

import NavigationBarPublic from './index'


describe('<NavigationBarPublic />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<NavigationBarPublic />)

    expect(wrapper).toMatchSnapshot()
  })
})
