import React from 'react'
import { shallow } from 'enzyme'

import NavigationBarLoggedIn from './index'


describe('<NavigationBarLoggedIn />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<NavigationBarLoggedIn />)

    expect(wrapper).toMatchSnapshot()
  })
})
