import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesSinglePage } from './index'


describe('HomeAppsSinglePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesSinglePage />)

    expect(component).toMatchSnapshot()
  })
})
