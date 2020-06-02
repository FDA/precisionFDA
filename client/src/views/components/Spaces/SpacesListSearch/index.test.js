import React from 'react'
import { shallow } from 'enzyme'

import SpacesListSearch from './'


describe('<SpacesListSearch />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<SpacesListSearch />)
    expect(wrapper).toMatchSnapshot()
  })
})
