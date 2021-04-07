import React from 'react'
import { shallow } from 'enzyme'

import NavigationBar from './index'


describe('<NavigationBar />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<NavigationBar />)

    expect(wrapper).toMatchSnapshot()
  })
})
