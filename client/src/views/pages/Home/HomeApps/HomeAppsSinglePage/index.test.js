import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsSinglePage } from './index'


describe('HomeAppsSinglePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsSinglePage />)

    expect(component).toMatchSnapshot()
  })
})
