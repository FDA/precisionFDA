import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsSinglePage } from './index'


describe('HomeExecutionsSinglePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsSinglePage />)

    expect(component).toMatchSnapshot()
  })
})
