import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsSpacesPage } from './index'


describe('HomeExecutionsSpacesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsSpacesPage />)

    expect(component).toMatchSnapshot()
  })
})
