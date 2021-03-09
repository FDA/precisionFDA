import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsPage } from './index'


describe('HomeExecutionsPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsPage />)

    expect(component).toMatchSnapshot()
  })
})
